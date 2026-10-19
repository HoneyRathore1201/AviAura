"""Pydantic request/response models (the API contract)."""

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


DietaryPref = Literal["none", "vegetarian", "vegan", "halal", "jain"]
ActivityPref = Literal["balanced", "culture", "adventure", "food", "nature", "nightlife"]
PacePref = Literal["relaxed", "moderate", "packed"]
CostCategory = Literal["food", "activity", "transport", "lodging", "other"]


class Preferences(BaseModel):
    dietary: DietaryPref = "none"
    food_preference: Literal["all", "veg_only", "non_veg", "vegan", "jain"] = "all"
    stay_style: Literal["budget", "boutique", "luxury"] = "boutique"
    activity_type: ActivityPref = "balanced"
    pace: PacePref = "moderate"


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    user_id: str
    name: str
    email: EmailStr
    avatar: str | None = None
    created_at: datetime


class GoogleAuthRequest(BaseModel):
    credential: str = Field(min_length=1, description="Google ID Token from Google Identity Services")


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class TripGenerateRequest(BaseModel):
    destination: str = Field(min_length=2, max_length=120)
    start_date: date
    duration_days: int = Field(ge=1, le=10)
    total_budget: float = Field(gt=0)
    group_size: int = Field(ge=1, le=20)
    preferences: Preferences = Field(default_factory=Preferences)
    currency: str = "INR"


class ItineraryItem(BaseModel):
    time_slot: str
    activity_name: str
    location_name: str
    category: CostCategory = "activity"
    estimated_cost: float = 0
    notes: str = ""
    indoor_alternative: str = ""
    location_coords: dict[str, float] | None = None
    dietary_tag: str | None = None
    place_type: str | None = None
    rating: float | None = None


class DayPlan(BaseModel):
    day_number: int
    theme: str = ""
    date: str | None = None
    items: list[ItineraryItem] = Field(default_factory=list)
    day_total: float = 0


class BudgetBreakdown(BaseModel):
    total_estimated: float
    user_budget: float
    over_budget: bool
    by_category: dict[str, float]
    by_day: list[float]
    currency: str = "INR"
    note: str = ""


class WeatherDay(BaseModel):
    date: str
    temp_min: float | None = None
    temp_max: float | None = None
    description: str = ""
    icon: str = ""
    rain_mm: float = 0
    note: str = ""
    available: bool = True


class TripPlanOut(BaseModel):
    trip_id: str | None = None
    destination: str
    start_date: str
    duration_days: int
    total_budget: float
    group_size: int
    preferences: Preferences
    currency: str = "INR"
    summary: str = ""
    days: list[DayPlan]
    budget: BudgetBreakdown
    weather: list[WeatherDay] = Field(default_factory=list)
    destination_coords: dict[str, float] | None = None
    model_used: str = ""
    created_date: datetime | None = None


class ChatMessage(BaseModel):
    role: Literal["user", "model", "system"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    destination: str | None = None
    trip_context: dict | None = None


class ChatResponse(BaseModel):
    reply: str

