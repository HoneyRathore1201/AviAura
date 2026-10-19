"""Async MongoDB connection via Motor."""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import get_settings

_client: AsyncIOMotorClient | None = None


async def connect_db() -> None:
    global _client
    settings = get_settings()
    _client = AsyncIOMotorClient(settings.mongodb_uri)
    # Fail fast on startup if Atlas is unreachable / credentials are wrong.
    await _client.admin.command("ping")
    db = _client[settings.mongodb_db_name]
    await db.users.create_index("email", unique=True)
    await db.trip_plans.create_index("user_id")
    await db.daily_itineraries.create_index("trip_id")


async def close_db() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None


def get_db() -> AsyncIOMotorDatabase:
    if _client is None:
        raise RuntimeError("MongoDB client is not connected")
    return _client[get_settings().mongodb_db_name]
