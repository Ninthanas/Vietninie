from fastapi import APIRouter, Depends, HTTPException
from typing import List
from database import TursoClient, get_db
from schemas.conversation import ConversationSummary, ConversationDetail
from services import conversation_service

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("", response_model=List[ConversationSummary])
async def list_conversations(db: TursoClient = Depends(get_db)):
    return await conversation_service.get_all_conversations(db)


@router.get("/{scenario_id}", response_model=ConversationDetail)
async def get_conversation(scenario_id: str, db: TursoClient = Depends(get_db)):
    conv = await conversation_service.get_conversation_detail(db, scenario_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv
