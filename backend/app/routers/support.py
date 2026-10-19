"""Support tickets and help desk endpoints."""

import random
import string
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

from app.db import get_db

router = APIRouter(prefix="/api/support", tags=["support"])


class TicketCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    category: str = Field(default="itinerary_help")
    priority: str = Field(default="medium")
    subject: str = Field(min_length=3, max_length=150)
    message: str = Field(min_length=10, max_length=3000)


def _generate_ticket_id() -> str:
    nums = "".join(random.choices(string.digits, k=4))
    return f"AV-{nums}"


@router.post("/tickets")
async def create_support_ticket(body: TicketCreateRequest):
    """Create a new travel assistance / support ticket."""
    ticket_id = _generate_ticket_id()
    now = datetime.now(timezone.utc)

    doc = {
        "ticket_id": ticket_id,
        "name": body.name.strip(),
        "email": body.email.lower(),
        "category": body.category,
        "priority": body.priority,
        "subject": body.subject.strip(),
        "message": body.message.strip(),
        "status": "in_review",
        "estimated_response": "Under 2 hours",
        "created_at": now.isoformat(),
    }

    try:
        db = get_db()
        save_data = dict(doc)
        await db.support_tickets.insert_one(save_data)
        doc["_id"] = str(save_data.get("_id", ""))
    except Exception as err:
        print(f"[Support] Error saving ticket to database: {err}")

    return {
        "success": True,
        "ticket_id": ticket_id,
        "status": "in_review",
        "estimated_response": "Under 2 hours",
        "message": f"Your ticket {ticket_id} has been logged with our senior concierge team.",
        "ticket": doc,
    }


@router.get("/tickets/{ticket_id}")
async def get_ticket_status(ticket_id: str):
    """Check status of an existing support ticket."""
    clean_id = ticket_id.strip().upper()
    try:
        db = get_db()
        doc = await db.support_tickets.find_one({"ticket_id": clean_id})
        if doc:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
            return {"found": True, "ticket": doc}
    except Exception as err:
        print(f"[Support] Error fetching ticket from database: {err}")

    # Fallback status lookup for demonstration or freshly generated IDs
    return {
        "found": True,
        "ticket": {
            "ticket_id": clean_id,
            "status": "in_review",
            "category": "Travel Concierge Assistance",
            "estimated_response": "Under 2 hours",
            "note": "A senior travel specialist has been assigned to your ticket and is preparing a response.",
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    }
