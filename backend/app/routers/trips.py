"""Generate itineraries (guest-friendly) and persist saved trips (auth)."""

from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.db import get_db
from app.deps import get_current_user
from app.schemas import TripGenerateRequest, TripPlanOut
from app.services.budget import summarize_budget
from app.services.gemini import generate_itinerary_json, parse_itinerary
from app.services.weather import fetch_forecast, geocode_many, geocode_place

router = APIRouter(prefix="/api", tags=["trips"])


async def _build_plan(body: TripGenerateRequest) -> TripPlanOut:
    raw, model_used = await generate_itinerary_json(body)
    summary, days = parse_itinerary(raw, body)
    budget = summarize_budget(days, body.total_budget, body.currency)

    # If the first draft overshoots, ask Gemini once more with a hard cap.
    if budget.over_budget:
        extra = (
            f"The previous draft cost {budget.total_estimated} {body.currency}. "
            f"Rebuild the same destination so the SUM of estimated_cost is "
            f"AT MOST {body.total_budget} {body.currency}. Drop paid extras first."
        )
        raw, model_used = await generate_itinerary_json(body, extra=extra)
        summary, days = parse_itinerary(raw, body)
        budget = summarize_budget(days, body.total_budget, body.currency)

    dest_geo = await geocode_place(body.destination)
    dest_coords = None
    if dest_geo:
        dest_coords = {"lat": dest_geo["lat"], "lon": dest_geo["lon"]}

    # Collect locations that don't already have coordinates from Gemini
    needed_geocoding = []
    for day in days:
        for item in day.items:
            if not item.location_coords:
                needed_geocoding.append(item.location_name or body.destination)

    coords_map = await geocode_many(needed_geocoding, body.destination) if needed_geocoding else {}

    for day in days:
        for idx, item in enumerate(day.items):
            if not item.location_coords:
                loc = item.location_name or body.destination
                item.location_coords = coords_map.get(loc) or dest_coords

    # If destination itself was missing or distant from actual stops, center on the itinerary stops
    all_stop_coords = [
        item.location_coords
        for day in days
        for item in day.items
        if item.location_coords and "lat" in item.location_coords and "lon" in item.location_coords
    ]
    if all_stop_coords:
        avg_lat = sum(c["lat"] for c in all_stop_coords) / len(all_stop_coords)
        avg_lon = sum(c["lon"] for c in all_stop_coords) / len(all_stop_coords)
        if not dest_coords:
            dest_coords = {"lat": round(avg_lat, 4), "lon": round(avg_lon, 4)}
        else:
            # If OWM geocoded to another country/faraway city (> 2.5 degrees away), prefer stops center
            if abs(dest_coords["lat"] - avg_lat) > 2.5 or abs(dest_coords["lon"] - avg_lon) > 2.5:
                dest_coords = {"lat": round(avg_lat, 4), "lon": round(avg_lon, 4)}

    weather = []
    if dest_coords:
        weather = await fetch_forecast(
            dest_coords["lat"], dest_coords["lon"], body.start_date, body.duration_days
        )
        rain_days = {w.date for w in weather if w.available and ("rain" in w.note.lower() or w.rain_mm >= 2)}
        for day in days:
            if day.date in rain_days:
                for item in day.items:
                    if item.indoor_alternative:
                        item.notes = (item.notes + " " if item.notes else "") + f"Weather note: {item.indoor_alternative}"

    return TripPlanOut(
        destination=body.destination,
        start_date=body.start_date.isoformat(),
        duration_days=body.duration_days,
        total_budget=body.total_budget,
        group_size=body.group_size,
        preferences=body.preferences,
        currency=body.currency,
        summary=summary,
        days=days,
        budget=budget,
        weather=weather,
        destination_coords=dest_coords,
        model_used=model_used,
        created_date=datetime.now(timezone.utc),
    )


@router.post("/itinerary/generate", response_model=TripPlanOut)
async def generate_itinerary(body: TripGenerateRequest):
    try:
        return await _build_plan(body)
    except Exception as exc:  # surface a clean error for the viva demo
        raise HTTPException(status_code=502, detail=f"Could not generate itinerary: {exc}") from exc


def _serialize_trip(plan, details) -> TripPlanOut:
    return TripPlanOut(
        trip_id=str(plan["_id"]),
        destination=plan["destination"],
        start_date=plan["start_date"],
        duration_days=plan["duration_days"],
        total_budget=plan["total_budget"],
        group_size=plan.get("group_size", 1),
        preferences=plan.get("preferences") or {},
        currency=plan.get("currency", "INR"),
        summary=plan.get("summary", ""),
        days=plan.get("days") or [],
        budget=plan.get("budget"),
        weather=plan.get("weather") or [],
        destination_coords=plan.get("destination_coords"),
        model_used=plan.get("model_used", ""),
        created_date=plan.get("created_date"),
    )


@router.post("/trips", response_model=TripPlanOut)
async def save_trip(body: TripPlanOut, user=Depends(get_current_user)):
    db = get_db()
    now = datetime.now(timezone.utc)
    plan_doc = {
        "user_id": str(user["_id"]),
        "destination": body.destination,
        "duration_days": body.duration_days,
        "total_budget": body.total_budget,
        "preferences": body.preferences.model_dump(),
        "created_date": now,
        "start_date": body.start_date,
        "group_size": body.group_size,
        "currency": body.currency,
        "summary": body.summary,
        "days": [d.model_dump() for d in body.days],
        "budget": body.budget.model_dump(),
        "weather": [w.model_dump() for w in body.weather],
        "destination_coords": body.destination_coords,
        "model_used": body.model_used,
    }
    result = await db.trip_plans.insert_one(plan_doc)
    trip_id = result.inserted_id

    daily_docs = []
    for day in body.days:
        for item in day.items:
            coords = item.location_coords or {}
            daily_docs.append(
                {
                    "trip_id": str(trip_id),
                    "day_number": day.day_number,
                    "time_slot": item.time_slot,
                    "activity_name": item.activity_name,
                    "location_coords": coords,
                    "estimated_cost": item.estimated_cost,
                    "location_name": item.location_name,
                    "category": item.category,
                    "dietary_tag": item.dietary_tag,
                    "place_type": item.place_type,
                    "rating": item.rating,
                }
            )
    if daily_docs:
        await db.daily_itineraries.insert_many(daily_docs)

    plan_doc["_id"] = trip_id
    return _serialize_trip(plan_doc, daily_docs)


@router.get("/trips", response_model=list[TripPlanOut])
async def list_trips(user=Depends(get_current_user)):
    db = get_db()
    cursor = db.trip_plans.find({"user_id": str(user["_id"])}).sort("created_date", -1)
    trips = []
    async for plan in cursor:
        trips.append(_serialize_trip(plan, []))
    return trips


@router.get("/trips/{trip_id}", response_model=TripPlanOut)
async def get_trip(trip_id: str, user=Depends(get_current_user)):
    db = get_db()
    try:
        oid = ObjectId(trip_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid trip id")
    plan = await db.trip_plans.find_one({"_id": oid, "user_id": str(user["_id"])})
    if not plan:
        raise HTTPException(status_code=404, detail="Trip not found")
    return _serialize_trip(plan, [])


@router.delete("/trips/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(trip_id: str, user=Depends(get_current_user)):
    db = get_db()
    try:
        oid = ObjectId(trip_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid trip id")
    plan = await db.trip_plans.find_one({"_id": oid, "user_id": str(user["_id"])})
    if not plan:
        raise HTTPException(status_code=404, detail="Trip not found")
    await db.trip_plans.delete_one({"_id": oid})
    await db.daily_itineraries.delete_many({"trip_id": trip_id})
    return None


@router.get("/me")
async def me(user=Depends(get_current_user)):
    return {
        "user_id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "avatar": user.get("avatar"),
        "created_at": user["created_at"],
    }
