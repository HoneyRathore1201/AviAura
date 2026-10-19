"""Aviaura FastAPI entrypoint."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import close_db, connect_db
from app.routers.auth import router as auth_router
from app.routers.chat import router as chat_router
from app.routers.support import router as support_router
from app.routers.trips import router as trips_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await connect_db()
    yield
    await close_db()


settings = get_settings()
app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(trips_router)
app.include_router(chat_router)
app.include_router(support_router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.app_name}
