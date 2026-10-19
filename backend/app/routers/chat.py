"""Chatbot endpoints for Aviaura AI Concierge."""

from fastapi import APIRouter, HTTPException

from app.schemas import ChatRequest, ChatResponse
from app.services.gemini import generate_chat_reply

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat_with_concierge(body: ChatRequest):
    """Chat with the 24/7 AI Travel Concierge."""
    if not body.messages:
        raise HTTPException(status_code=400, detail="No messages provided")
    try:
        reply = await generate_chat_reply(body)
        return ChatResponse(reply=reply)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI Concierge error: {exc}") from exc
