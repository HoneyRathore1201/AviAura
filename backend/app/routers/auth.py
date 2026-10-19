"""Auth routes: Google OAuth + signup + login."""

from datetime import datetime, timezone
import httpx
from fastapi import APIRouter, HTTPException, status

from app.config import get_settings
from app.db import get_db
from app.schemas import AuthResponse, GoogleAuthRequest, LoginRequest, SignupRequest, UserOut
from app.utils.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _user_out(doc) -> UserOut:
    return UserOut(
        user_id=str(doc["_id"]),
        name=doc["name"],
        email=doc["email"],
        avatar=doc.get("avatar"),
        created_at=doc.get("created_at") or datetime.now(timezone.utc),
    )


@router.post("/google", response_model=AuthResponse)
async def google_auth(body: GoogleAuthRequest):
    """Authenticate or register user using a verified Google OAuth ID Token."""
    settings = get_settings()
    token = body.credential.strip()

    # Development demo bypass support
    if token.startswith("demo_"):
        email = "traveler.demo@aviaura.com"
        name = "Aura Traveler"
        avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80"
        google_id = "demo_google_id_12345"
    else:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    "https://oauth2.googleapis.com/tokeninfo",
                    params={"id_token": token},
                )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google authentication token.")
            payload = resp.json()
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=401, detail=f"Google authentication service error: {exc}"
            ) from exc

        # Verify audience if configured
        if settings.google_client_id and payload.get("aud") != settings.google_client_id:
            raise HTTPException(status_code=401, detail="Google Client ID mismatch.")

        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Google account has no verified email address.")

        name = payload.get("name") or email.split("@")[0]
        avatar = payload.get("picture")
        google_id = payload.get("sub")

    db = get_db()
    existing = await db.users.find_one({"email": email.lower()})
    now = datetime.now(timezone.utc)

    if existing:
        update_fields = {"last_login": now}
        if google_id and not existing.get("google_id"):
            update_fields["google_id"] = google_id
        if avatar and not existing.get("avatar"):
            update_fields["avatar"] = avatar
        await db.users.update_one({"_id": existing["_id"]}, {"$set": update_fields})
        doc = existing
        doc["name"] = existing.get("name") or name
        doc["avatar"] = existing.get("avatar") or avatar
    else:
        doc = {
            "name": name,
            "email": email.lower(),
            "google_id": google_id,
            "avatar": avatar,
            "created_at": now,
            "last_login": now,
        }
        result = await db.users.insert_one(doc)
        doc["_id"] = result.inserted_id

    access_token = create_access_token(str(doc["_id"]), {"email": doc["email"]})
    return AuthResponse(token=access_token, user=_user_out(doc))


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest):
    db = get_db()
    existing = await db.users.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    doc = {
        "name": body.name.strip(),
        "email": body.email.lower(),
        "password_hash": hash_password(body.password),
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    token = create_access_token(str(result.inserted_id), {"email": doc["email"]})
    return AuthResponse(token=token, user=_user_out(doc))


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    db = get_db()
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["_id"]), {"email": user["email"]})
    return AuthResponse(token=token, user=_user_out(user))
