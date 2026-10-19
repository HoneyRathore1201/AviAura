"""Gemini itinerary generation with strict JSON + defensive parsing."""

from __future__ import annotations

import json
import re
from datetime import date, timedelta

from groq import Groq

from app.config import get_settings
from app.schemas import ChatRequest, DayPlan, ItineraryItem, Preferences, TripGenerateRequest

SYSTEM_PROMPT = """
You are Aviaura, an expert smart travel assistant providing hyper-realistic, budget-honest itineraries for travellers, students, and groups.

Return ONLY valid JSON. No markdown fences, no commentary.

Schema:
{
  "summary": "2-3 sentence trip overview capturing the vibe, highlights, and stay/dining character",
  "days": [
    {
      "day_number": 1,
      "theme": "short theme",
      "items": [
        {
          "time_slot": "09:00-12:00",
          "activity_name": "short name",
          "location_name": "exact real place or venue name",
          "latitude": 26.9124,
          "longitude": 75.7873,
          "category": "food|activity|transport|lodging|other",
          "place_type": "restaurant|hotel|attraction|transit|cafe",
          "dietary_tag": "Pure Veg|Non-Veg Available|Vegan Friendly|Jain Available|N/A",
          "rating": 4.5,
          "estimated_cost": 0,
          "notes": "exact highlights, recommended dish for restaurants, or stay perk for hotels",
          "indoor_alternative": "backup if weather is bad, or empty string"
        }
      ]
    }
  ]
}

Strict Rules:
- SPECIFIC REAL-WORLD RESTAURANTS: For every meal (breakfast/lunch/dinner), recommend an EXACT, real, well-rated restaurant or cafe in that destination (e.g. "LMB (Laxmi Misthan Bhandar)", "Handi Restaurant", "Fisherman's Wharf", "Garam Dharam").
- VEG / NON-VEG HONOURING: Respect the user's food preference strictly. If veg_only or jain, EVERY single restaurant must be tagged "Pure Veg" or "Jain Available" and be authentic vegetarian places. If non_veg, highlight famous local meat/seafood specialties (e.g., Laal Maas, Goan Fish Curry, Butter Chicken).
- SPECIFIC REAL-WORLD HOTELS: Recommend an EXACT real hotel/resort/hostel per night matching their stay_style and total budget (e.g. "Zostel Jaipur", "Treebo Trend", "Alsisar Haveli", "W Goa"). Put lodging in late evening slots with estimated cost per night for the whole group.
- estimated_cost is a NUMBER in the requested currency for the WHOLE GROUP (not per person).
- Include stay, meals, local transport (auto/cab/metro), and tickets/activities.
- Provide accurate approximate latitude and longitude numbers for location_name.
- 3 to 6 items per day depending on pace.
- time_slot must be "HH:MM-HH:MM" 24h.
""".strip()


def _client() -> Groq:
    return Groq(api_key=get_settings().groq_api_key)


def _strip_json(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    match = re.search(r"\{[\s\S]*\}", text)
    return match.group(0) if match else text


def _user_prompt(req: TripGenerateRequest, extra: str = "") -> str:
    prefs: Preferences = req.preferences
    end = req.start_date + timedelta(days=req.duration_days - 1)
    
    food_instruction = {
        "veg_only": "CRITICAL: The travellers require 100% PURE VEGETARIAN dining. Recommend only famous pure-veg restaurants/bhojanalayas.",
        "non_veg": "The travellers enjoy NON-VEG food. Recommend iconic places famous for local meat, poultry, or seafood specialties.",
        "vegan": "The travellers require VEGAN dining options.",
        "jain": "The travellers require strictly JAIN food (no onion/garlic/root veg). Recommend pure Jain/veg spots.",
        "all": "Balanced dining: include popular local restaurants with both vegetarian and non-vegetarian choices.",
    }.get(prefs.food_preference, "Include popular local dining.")

    stay_instruction = {
        "budget": "Lodging style: Budget-friendly (backpackers hostels like Zostel, clean guest houses, or budget stays under ₹2,000/night).",
        "boutique": "Lodging style: Charming boutique hotels or mid-range heritage stays (₹3,000-₹6,000/night).",
        "luxury": "Lodging style: Premium luxury resorts or iconic heritage havelis/palaces.",
    }.get(prefs.stay_style, "Lodging: Balanced quality stays.")

    return f"""
Plan a trip with these constraints:
- Destination: {req.destination}
- Dates: {req.start_date.isoformat()} to {end.isoformat()} ({req.duration_days} days)
- Group size: {req.group_size}
- Total budget for the WHOLE group: {req.total_budget} {req.currency}
- Food Preference: {prefs.food_preference.upper()} — {food_instruction}
- Stay Style: {prefs.stay_style.upper()} — {stay_instruction}
- Dietary tag: {prefs.dietary}
- Activity focus: {prefs.activity_type}
- Pace: {prefs.pace}

Costs MUST include stay, food, local transport, and tickets, as group totals.
Name real, specific restaurants and hotels with ratings!
{extra}
""".strip()


def _parse_days(raw: dict, start: date, duration: int) -> list[DayPlan]:
    days_in = raw.get("days") or []
    if not isinstance(days_in, list):
        raise ValueError("AI output missing days[]")

    allowed = {"food", "activity", "transport", "lodging", "other"}
    parsed: list[DayPlan] = []
    for i, day in enumerate(days_in, start=1):
        if not isinstance(day, dict):
            continue
        items = []
        for item in day.get("items") or []:
            if not isinstance(item, dict):
                continue
            cat = str(item.get("category") or "activity").lower()
            if cat not in allowed:
                cat = "activity"
            try:
                cost = float(item.get("estimated_cost") or 0)
            except (TypeError, ValueError):
                cost = 0.0
            name = str(item.get("activity_name") or "").strip()
            loc = str(item.get("location_name") or name).strip()
            if not name:
                continue

            coords = None
            lat_val = item.get("latitude") if item.get("latitude") is not None else item.get("lat")
            lon_val = item.get("longitude") if item.get("longitude") is not None else item.get("lon")
            if lat_val is not None and lon_val is not None:
                try:
                    coords = {"lat": float(lat_val), "lon": float(lon_val)}
                except (TypeError, ValueError):
                    coords = None

            rating_val = None
            try:
                if item.get("rating") is not None:
                    rating_val = round(float(item["rating"]), 1)
            except (TypeError, ValueError):
                rating_val = None

            items.append(
                ItineraryItem(
                    time_slot=str(item.get("time_slot") or "09:00-12:00"),
                    activity_name=name,
                    location_name=loc,
                    category=cat,  # type: ignore[arg-type]
                    place_type=str(item.get("place_type") or ("hotel" if cat == "lodging" else ("restaurant" if cat == "food" else "attraction"))),
                    dietary_tag=item.get("dietary_tag"),
                    rating=rating_val,
                    estimated_cost=max(0.0, cost),
                    notes=str(item.get("notes") or ""),
                    indoor_alternative=str(item.get("indoor_alternative") or ""),
                    location_coords=coords,
                )
            )
        day_number = int(day.get("day_number") or i)
        parsed.append(
            DayPlan(
                day_number=day_number,
                theme=str(day.get("theme") or f"Day {day_number}"),
                date=(start + timedelta(days=day_number - 1)).isoformat(),
                items=items,
            )
        )

    # Guarantee the requested number of days even if the model skipped some.
    by_num = {d.day_number: d for d in parsed}
    filled: list[DayPlan] = []
    for n in range(1, duration + 1):
        if n in by_num and by_num[n].items:
            filled.append(by_num[n])
        else:
            filled.append(
                DayPlan(
                    day_number=n,
                    theme=f"Day {n} — free exploration",
                    date=(start + timedelta(days=n - 1)).isoformat(),
                    items=[
                        ItineraryItem(
                            time_slot="10:00-16:00",
                            activity_name="Self-guided neighbourhood walk",
                            location_name="",
                            category="activity",
                            estimated_cost=0,
                            notes="AI did not return this day; placeholder added.",
                        )
                    ],
                )
            )
    return filled


async def _generate_once(model: str, prompt: str) -> tuple[dict, str]:
    client = _client()
    response = await client.aio.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            temperature=0.6,
        ),
    )
    text = response.text or ""
    data = json.loads(_strip_json(text))
    if not isinstance(data, dict):
        raise ValueError("AI JSON root is not an object")
    return data, model


async def generate_itinerary_json(
    req: TripGenerateRequest,
    extra: str = "",
) -> tuple[dict, str]:
    """Try Flash first; fall back to Flash-Lite, then Pro if needed."""
    settings = get_settings()
    prompt = _user_prompt(req, extra)

    # Cascade order: primary flash, fast fallback flash-lite, robust pro
    models = [
        get_settings().groq_model,
    ]
    candidate_models: list[str] = []
    for m in models:
        if m and m not in candidate_models:
            candidate_models.append(m)

    last_error: Exception | None = None
    client = _client()
    for model in candidate_models:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": prompt}],
                temperature=0.6,
            )
            text = response.choices[0].message.content or ""
            data = json.loads(_strip_json(text))
            if not isinstance(data, dict):
                raise ValueError("AI JSON root is not an object")
            return data, model
        except Exception as exc:  # noqa: BLE001
            print(f"[Aviaura] Model {model} generation attempt failed: {exc}")
            last_error = exc
            continue

    raise RuntimeError(f"All Groq models failed ({candidate_models}): {last_error}")


def parse_itinerary(raw: dict, req: TripGenerateRequest) -> tuple[str, list[DayPlan]]:
    summary = str(raw.get("summary") or f"A {req.duration_days}-day plan for {req.destination}.")
    return summary, _parse_days(raw, req.start_date, req.duration_days)


CHAT_SYSTEM_PROMPT = """
You are AURA AI, the signature intelligent travel concierge for Aviaura.
You help travellers with practical, inspiring, and budget-smart advice:
- Provide specific recommendations: exact cafe and restaurant names, authentic local dishes, secret viewpoints, packing tips, budget hacks.
- If asked about food, always clearly indicate pure vegetarian vs non-vegetarian specialties.
- If asked about hotels, suggest options that match their budget tier.
- Keep responses concise, warm, structured with bullet points, and easy to read on mobile.
- Always maintain your identity as AURA AI.
""".strip()


async def generate_chat_reply(req: ChatRequest) -> str:
    """Generate conversational travel advice using the Gemini cascade."""
    client = _client()
    context_str = ""
    if req.destination:
        context_str += f"\nActive destination in view: {req.destination}"
    if req.trip_context:
        try:
            context_str += f"\nTrip context: {json.dumps(req.trip_context)}"
        except Exception:
            pass

    conversation = ""
    for msg in req.messages[-6:]:
        prefix = "User" if msg.role == "user" else "Assistant"
        conversation += f"\n{prefix}: {msg.content}"

    full_prompt = f"{CHAT_SYSTEM_PROMPT}\n{context_str}\n\nRecent conversation:\n{conversation}\n\nAssistant:"

    settings = get_settings()
    models = [
        settings.groq_model,
    ]
    for model in models:
        try:
            resp = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": CHAT_SYSTEM_PROMPT},
                    {"role": "user", "content": f"{context_str}\n\nRecent conversation:\n{conversation}\n\nAssistant:"}
                ],
                temperature=0.7,
                max_tokens=600,
            )
            if resp.choices[0].message.content:
                return resp.choices[0].message.content.strip()
        except Exception as exc:
            print(f"[Aviaura Chat] Model {model} failed: {exc}")
            continue

    return "I'm having a brief connection delay. Please ask again in a moment!"
