"""OpenWeatherMap geocoding + 5-day forecast helpers."""

import asyncio
from datetime import date, datetime, timedelta

import httpx

from app.config import get_settings
from app.schemas import WeatherDay

GEO_URL = "https://api.openweathermap.org/geo/1.0/direct"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"


async def geocode_place(query: str, country_hint: str | None = None) -> dict[str, float] | None:
    """Turn a place name into lat/lon. Returns None if nothing matches or error occurs."""
    settings = get_settings()
    # Strip excessive punctuation or duplicate tokens that cause OWM 404s
    clean_query = query.strip()
    q = clean_query if not country_hint else f"{clean_query},{country_hint}"
    params = {"q": q, "limit": 1, "appid": settings.openweathermap_api_key}
    
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.get(GEO_URL, params=params)
            if res.status_code != 200:
                return None
            data = res.json()
            if not data or not isinstance(data, list):
                return None
            return {
                "lat": float(data[0]["lat"]),
                "lon": float(data[0]["lon"]),
                "name": data[0].get("name", query),
            }
    except Exception:
        return None


async def geocode_many(names: list[str], destination: str) -> dict[str, dict[str, float]]:
    """Geocode unique stop names concurrently, biasing queries with the destination city."""
    unique: list[str] = []
    seen = set()
    for name in names:
        key = name.strip().lower()
        if key and key not in seen:
            seen.add(key)
            unique.append(name.strip())

    if not unique:
        return {}

    semaphore = asyncio.Semaphore(5)

    async def _lookup(name: str) -> tuple[str, dict[str, float] | None]:
        async with semaphore:
            # First try "attraction, destination", fallback to just attraction
            result = await geocode_place(f"{name}, {destination}")
            if not result:
                result = await geocode_place(name)
            if result:
                return name, {"lat": result["lat"], "lon": result["lon"]}
            return name, None

    results = await asyncio.gather(*[_lookup(name) for name in unique], return_exceptions=True)
    coords: dict[str, dict[str, float]] = {}
    for item in results:
        if isinstance(item, tuple) and item[1] is not None:
            coords[item[0]] = item[1]
    return coords


def _icon_note(description: str, rain_mm: float) -> str:
    d = description.lower()
    if rain_mm >= 2 or "rain" in d or "storm" in d:
        return "Rain expected — indoor alternative suggested."
    if "snow" in d:
        return "Snow possible — allow extra travel time and dress warm."
    if "clear" in d or "sun" in d:
        return "Clear skies — a good day for outdoor stops."
    if "cloud" in d:
        return "Cloudy — outdoor plans are still fine."
    return ""


async def fetch_forecast(lat: float, lon: float, start: date, duration_days: int) -> list[WeatherDay]:
    """
    Free OWM plan: 5-day / 3-hour forecast only.
    Days beyond that window or on failure are returned with available=False.
    """
    settings = get_settings()
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.openweathermap_api_key,
        "units": settings.openweathermap_units,
    }
    
    payload = None
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(FORECAST_URL, params=params)
            if res.status_code == 200:
                payload = res.json()
    except Exception:
        payload = None

    by_date: dict[str, list[dict]] = {}
    if payload and isinstance(payload, dict):
        for row in payload.get("list", []):
            dt = datetime.fromtimestamp(row["dt"]).date().isoformat()
            by_date.setdefault(dt, []).append(row)

    days: list[WeatherDay] = []
    for i in range(duration_days):
        d = start + timedelta(days=i)
        key = d.isoformat()
        slots = by_date.get(key)
        if not slots:
            days.append(
                WeatherDay(
                    date=key,
                    available=False,
                    note="Beyond the 5-day OpenWeather forecast window.",
                )
            )
            continue
        temps = [s["main"]["temp"] for s in slots if "main" in s]
        rain = sum(s.get("rain", {}).get("3h", 0) or 0 for s in slots)
        weather = slots[len(slots) // 2].get("weather", [{}])[0]
        desc = weather.get("description", "")
        days.append(
            WeatherDay(
                date=key,
                temp_min=round(min(temps), 1) if temps else None,
                temp_max=round(max(temps), 1) if temps else None,
                description=desc,
                icon=weather.get("icon", ""),
                rain_mm=round(rain, 1),
                note=_icon_note(desc, rain),
                available=True,
            )
        )
    return days
