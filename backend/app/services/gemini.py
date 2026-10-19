"""Aviaura AI service: Groq ultra-fast inference + Gemini failover + multi-key pool + domain engine."""

from __future__ import annotations

import itertools
import json
import re
from datetime import date, timedelta
from typing import Any

from google import genai
from google.genai import types
from groq import Groq

from app.config import get_settings
from app.schemas import ChatRequest, DayPlan, ItineraryItem, Preferences, TripGenerateRequest

# Thread-safe round-robin key indices
_groq_key_cycle: itertools.cycle | None = None
_gemini_key_cycle: itertools.cycle | None = None
_cached_groq_keys: list[str] = []
_cached_gemini_keys: list[str] = []


def _get_next_groq_client() -> tuple[Groq | None, str]:
    """Get next available Groq client from the configured multi-key pool."""
    global _groq_key_cycle, _cached_groq_keys
    settings = get_settings()
    keys = settings.get_groq_keys()
    if not keys:
        return None, ""
    if keys != _cached_groq_keys or _groq_key_cycle is None:
        _cached_groq_keys = list(keys)
        _groq_key_cycle = itertools.cycle(_cached_groq_keys)
    key = next(_groq_key_cycle)
    return Groq(api_key=key), key


def _get_next_gemini_client() -> tuple[genai.Client | None, str]:
    """Get next available Gemini client from the configured multi-key pool."""
    global _gemini_key_cycle, _cached_gemini_keys
    settings = get_settings()
    keys = settings.get_gemini_keys()
    if not keys:
        return None, ""
    if keys != _cached_gemini_keys or _gemini_key_cycle is None:
        _cached_gemini_keys = list(keys)
        _gemini_key_cycle = itertools.cycle(_cached_gemini_keys)
    key = next(_gemini_key_cycle)
    return genai.Client(api_key=key), key


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
                    place_type=str(
                        item.get("place_type")
                        or ("hotel" if cat == "lodging" else ("restaurant" if cat == "food" else "attraction"))
                    ),
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


async def generate_itinerary_json(
    req: TripGenerateRequest,
    extra: str = "",
) -> tuple[dict, str]:
    """Generate itinerary using multi-key Groq pool with seamless Gemini failover."""
    settings = get_settings()
    prompt = _user_prompt(req, extra)

    groq_keys = settings.get_groq_keys()
    groq_models = [settings.groq_model, "openai/gpt-oss-120b", "openai/gpt-oss-20b"]
    groq_models = [m for i, m in enumerate(groq_models) if m and m not in groq_models[:i]]

    last_error: Exception | None = None

    # 1. Try Groq across all available keys
    for _ in range(max(1, len(groq_keys))):
        client, key = _get_next_groq_client()
        if not client:
            break
        for model in groq_models:
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.4,
                    max_tokens=3000,
                )
                text = response.choices[0].message.content or ""
                data = json.loads(_strip_json(text))
                if isinstance(data, dict) and "days" in data:
                    return data, f"groq:{model}"
            except Exception as exc:  # noqa: BLE001
                print(f"[Aviaura Generator] Groq ({model}) attempt failed: {exc}")
                last_error = exc
                continue

    # 2. Seamless failover to Gemini pool
    gemini_keys = settings.get_gemini_keys()
    for _ in range(max(1, len(gemini_keys))):
        gclient, gkey = _get_next_gemini_client()
        if not gclient:
            break
        for gmodel in [settings.gemini_model, "gemini-2.5-flash"]:
            try:
                response = gclient.models.generate_content(
                    model=gmodel,
                    contents=f"{SYSTEM_PROMPT}\n\n{prompt}",
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.4,
                    ),
                )
                text = response.text or ""
                data = json.loads(_strip_json(text))
                if isinstance(data, dict) and "days" in data:
                    return data, f"gemini:{gmodel}"
            except Exception as exc:  # noqa: BLE001
                print(f"[Aviaura Generator] Gemini ({gmodel}) attempt failed: {exc}")
                last_error = exc
                continue

    raise RuntimeError(f"All AI generators failed across pools: {last_error}")


def parse_itinerary(raw: dict, req: TripGenerateRequest) -> tuple[str, list[DayPlan]]:
    summary = str(raw.get("summary") or f"A {req.duration_days}-day plan for {req.destination}.")
    return summary, _parse_days(raw, req.start_date, req.duration_days)


# Comprehensive knowledge base for AURA AI
CHAT_SYSTEM_PROMPT = """
You are AURA AI, the signature, hyper-intelligent travel assistant and concierge for Aviaura (aviaura.com).
You possess exhaustive knowledge of the Aviaura platform, travel logistics, and real-world destinations worldwide.

CORE IDENTITY & PLATFORM DETAILS:
- Name: AURA AI (Signature Travel Concierge for Aviaura).
- Creators & Engineering Team: Aviaura was engineered by Honey Rathore (Full-Stack & AI Architecture, LinkedIn: honeyrathore1201) and Kashish Tomar.
- Aviaura Purpose: An AI-powered travel operating system that replaces generic advice with verified, mathematically calibrated, and weather-aware travel itineraries.

AVIAURA'S SIGNATURE CAPABILITIES:
1. One-Click Trip Planning (/plan):
   - Users configure: Destination, Travel Dates, Duration (1-14 days), Group Size, Total Budget & Currency (INR ₹, USD $, EUR €, GBP £), Stay Style (Budget hostels like Zostel, Boutique heritage havelis, Luxury 5-star resorts), Dining Preference (100% Pure Veg, Jain, Non-Veg local specialties, Vegan, All), Pace (Relaxed, Moderate, Fast-Paced), and Activity Focus (Heritage, Beaches, Nightlife, Wellness, Adventure).
   - Generates day-by-day hourly timelines, real-world verified hotel recommendations with exact nightly rates, authentic restaurants with dietary flags, and interactive Leaflet map routes with geo-coordinates.
2. Weather Intelligence & Rain Backups:
   - Integrates OpenWeatherMap 5-day forecasts synced with itinerary dates.
   - For every outdoor activity, Aviaura dynamically computes indoor alternatives (museums, covered markets, historic palaces) in case of rain.
3. Transparent Budget Calibration:
   - Zero hidden fees or inflated tourist markups.
   - Breaks down exact spending into Lodging, Dining, Local Transit (Metro, Rickshaw, Cabs), Entry Tickets, and a 10% emergency buffer.
4. Support Desk (/support):
   - 24/7 Priority Resolution Desk directly connected to MongoDB Atlas.
   - Every submitted issue generates a unique tracking ID (e.g., AV-0612), assigned priority, and a guaranteed 1-2 hour response SLA.
5. Authentication & Profile (/profile):
   - Google OAuth 2.0 Single Sign-On and secure JWT authentication.
   - Users can save unlimited itineraries, sync across devices, and customize default travel preferences.
6. Explore Hub (/explore):
   - Real-time showcase of top trending destinations across India (Jaipur, Goa, Manali, Kerala, Udaipur, Varanasi) and global capitals (Tokyo, Paris, Bali, Dubai, Rome).

WHEN A USER ASKS TO PLAN A TRIP IN CHAT:
- Do NOT just tell them to visit the plan page!
- Provide a crisp, high-fidelity day-by-day itinerary directly in the chat with:
  * 🌟 Trip Theme & Vibe
  * 🏨 Recommended Stay (Exact name + estimated cost/night)
  * 📅 Day 1, Day 2, Day 3 Breakdown (Morning, Afternoon, Sunset/Night)
  * 🍽️ Curated Dining (Exact real restaurant names + Pure Veg / Non-Veg badge)
  * 💰 Total Estimated Group Budget Breakdown
- At the end, warmly suggest: "To view this on an interactive Leaflet route map with live 5-day weather sync and indoor backup alerts, head over to [Plan Trip](/plan)!"

COMMUNICATION STYLE:
- Fast, brilliant, decisive, structured with clear emojis, bold markdown, and bullet points.
- Always polite, enthusiastic, and helpful.
- Respect food and budget constraints strictly.
""".strip()


# Deterministic Domain Knowledge Fallback Engine (Guarantees 100% Uptime)
def _domain_knowledge_reply(query: str, destination: str | None = None) -> str:
    q = query.lower()

    # 1. Creators & Team
    if any(k in q for k in ["who built", "who created", "who made", "creator", "founder", "developer", "author", "honey", "kashish"]):
        return (
            "✨ **Aviaura Engineering Team**\n\n"
            "Aviaura was architected and built by:\n"
            "• **Honey Rathore** — Full-Stack & AI Systems Architecture (Connect on LinkedIn: [honeyrathore1201](https://linkedin.com/in/honeyrathore1201))\n"
            "• **Kashish Tomar** — Product Design & Engineering\n\n"
            "Aviaura was developed to solve generic, unreliable travel advice by combining real-time LLM intelligence, OpenWeather weather-safeguards, and real-world verified budgets."
        )

    # 2. How it works / Platform features
    if any(k in q for k in ["how does it work", "what is aviaura", "features", "website", "how to use", "how to plan"]):
        return (
            "🚀 **Welcome to Aviaura — AI-Powered Smart Travel Operating System**\n\n"
            "Here is how Aviaura makes trip planning effortless:\n\n"
            "1. **Smart Itinerary Engine ([/plan](/plan))**: Customize destination, duration, budget, stay style (Budget, Boutique, Luxury), and dining preferences (Pure Veg, Jain, Non-Veg). Receive an hourly day-by-day plan in seconds.\n"
            "2. **Interactive Leaflet Maps**: Visualize every stop with exact geographic coordinates and optimized route transit.\n"
            "3. **OpenWeather 5-Day Sync**: Real-time forecast integration with automatic indoor backups for rainy days.\n"
            "4. **Budget Calibration**: 100% transparent cost breakdowns without hidden tourist markups.\n"
            "5. **Support Ticket Desk ([/support](/support))**: 24/7 real-time ticket tracking powered by MongoDB Atlas.\n\n"
            "Ready to build your next adventure? Click **[Plan Trip](/plan)** to start!"
        )

    # 3. Support desk
    if any(k in q for k in ["support", "help", "ticket", "contact", "issue", "problem"]):
        return (
            "🛎️ **Aviaura 24/7 Priority Support Desk**\n\n"
            "Need assistance with a trip, booking, or platform query?\n"
            "• Visit **[Support Desk](/support)** to file a ticket.\n"
            "• Tickets are stored directly in MongoDB Atlas and assigned an instant tracking ID (e.g., `AV-0612`).\n"
            "• Our engineering & support team guarantees a 1–2 hour resolution SLA.\n\n"
            "You can also ask me any questions directly here in chat!"
        )

    # 4. Pure veg / Jain / Food preferences
    if any(k in q for k in ["veg", "jain", "vegetarian", "pure veg", "food", "dining"]):
        return (
            "🌱 **Pure Vegetarian & Jain Dining on Aviaura**\n\n"
            "Aviaura is engineered with strict culinary accuracy:\n"
            "• **Pure Veg Filter**: When selected, every suggested meal is verified pure vegetarian or bhojanalaya (e.g. LMB in Jaipur, Anandam in Rishikesh, Saravanaa Bhavan in the South).\n"
            "• **Jain Dining**: Strictly respects restrictions (no root vegetables, onion, or garlic).\n"
            "• **Non-Veg Highlights**: For meat and seafood enthusiasts, Aviaura highlights iconic authentic specialties like Goan fish thalis, Rajasthani Laal Maas, and Lucknowi kebabs.\n\n"
            "You can set your food preference anytime in the [Trip Planner](/plan)!"
        )

    # 5. Direct In-Chat Trip Planning (Popular destinations or general)
    if any(k in q for k in ["plan", "itinerary", "goa", "jaipur", "manali", "kerala", "udaipur", "varanasi", "trip", "days", "budget"]):
        dest = destination or ("Goa" if "goa" in q else ("Jaipur" if "jaipur" in q else ("Manali" if "manali" in q else "your dream destination")))
        return (
            f"✈️ **Curated 3-Day Getaway to {dest}**\n\n"
            f"**Vibe**: Coastal relaxation, cultural discovery & authentic local flavours.\n"
            f"**Recommended Stay**: Zostel or charming boutique heritage hotel (₹2,500–₹4,500/night).\n\n"
            "📅 **Day 1: Arrival & Sunset Views**\n"
            "• *Morning*: Check-in, refresh, and head for breakfast at a local cafe.\n"
            "• *Afternoon*: Historic landmark walk & local artisan bazaar exploration.\n"
            "• *Evening*: Panoramic sunset viewpoint followed by authentic dinner.\n\n"
            "📅 **Day 2: Adventure & Culinary Highlights**\n"
            "• *Morning*: Scenic heritage site or beach/nature trail.\n"
            "• *Afternoon*: Lunch at a top-rated dining spot (Pure Veg / Local specialities available).\n"
            "• *Evening*: Night market, live acoustic music, and street food tastings.\n\n"
            "📅 **Day 3: Scenic Leisure & Souvenirs**\n"
            "• *Morning*: Relaxed brunch and iconic photography spots.\n"
            "• *Afternoon*: Souvenir shopping, handicrafts, and departure prep.\n\n"
            "💰 **Estimated Budget**: ₹6,000 – ₹10,000 per person (includes stay, meals, and local transit).\n\n"
            "👉 **Want the full interactive Leaflet route map with live weather forecast?** Head over to **[Plan Trip](/plan)** to generate your custom trip in one click!"
        )

    # 6. Default warm concierge guidance
    return (
        "✦ **I am AURA AI, your personal Aviaura travel concierge.**\n\n"
        "I can help you with:\n"
        "• **Instant Trip Planning**: Ask me to plan a trip to any destination with your budget and days!\n"
        "• **Dietary & Dining**: Verified Pure Veg, Jain, or local non-vegetarian delicacies.\n"
        "• **Platform Guidance**: Learn how our 1-click planner, weather backups, and Leaflet maps work.\n"
        "• **Support Desk**: Direct you to our live MongoDB Atlas ticket desk at [/support](/support).\n\n"
        "What destination or question would you like to explore today?"
    )


async def generate_chat_reply(req: ChatRequest) -> str:
    """Generate conversational travel advice using fast Groq pool, Gemini failover, and zero-downtime domain fallback."""
    settings = get_settings()

    context_str = ""
    if req.destination:
        context_str += f"\nActive destination in view: {req.destination}"
    if req.trip_context:
        try:
            context_str += f"\nTrip context: {json.dumps(req.trip_context)}"
        except Exception:
            pass

    conversation = ""
    for msg in req.messages[-8:]:
        prefix = "User" if msg.role == "user" else "AURA AI"
        conversation += f"\n{prefix}: {msg.content}"

    groq_keys = settings.get_groq_keys()
    groq_models = [settings.groq_model, "qwen/qwen3.8-27b"]
    groq_models = [m for i, m in enumerate(groq_models) if m and m not in groq_models[:i]]

    # 1. Groq Ultra-Fast Inference with multi-key rotation
    for _ in range(max(1, len(groq_keys))):
        client, key = _get_next_groq_client()
        if not client:
            break
        for model in groq_models:
            try:
                resp = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": CHAT_SYSTEM_PROMPT},
                        {
                            "role": "user",
                            "content": f"{context_str}\n\nRecent conversation:\n{conversation}\n\nAURA AI:",
                        },
                    ],
                    temperature=0.6,
                    max_tokens=1200,
                )
                reply = resp.choices[0].message.content
                if reply and reply.strip():
                    return reply.strip()
            except Exception as exc:  # noqa: BLE001
                print(f"[Aviaura Chat] Groq ({model}) failed on key ...{key[-6:] if len(key) >= 6 else key}: {exc}")
                continue

    # 2. Gemini Failover across multi-key pool
    gemini_keys = settings.get_gemini_keys()
    for _ in range(max(1, len(gemini_keys))):
        gclient, gkey = _get_next_gemini_client()
        if not gclient:
            break
        for gmodel in [settings.gemini_model, "gemini-2.5-flash"]:
            try:
                full_prompt = (
                    f"{CHAT_SYSTEM_PROMPT}\n{context_str}\n\nRecent conversation:\n{conversation}\n\nAURA AI:"
                )
                response = gclient.models.generate_content(
                    model=gmodel,
                    contents=full_prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.6,
                        max_output_tokens=1200,
                    ),
                )
                reply = response.text
                if reply and reply.strip():
                    return reply.strip()
            except Exception as exc:  # noqa: BLE001
                print(f"[Aviaura Chat] Gemini ({gmodel}) failed on key ...{gkey[-6:] if len(gkey) >= 6 else gkey}: {exc}")
                continue

    # 3. Resilient Domain Knowledge Fallback (Guarantees user never sees an error!)
    last_user_query = req.messages[-1].content if req.messages else ""
    return _domain_knowledge_reply(last_user_query, req.destination)
