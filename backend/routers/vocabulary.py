from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from database import TursoClient, get_db
from schemas.vocabulary import VocabularyListResponse, VocabCategory, VietnameseLevel
from services import vocabulary_service

router = APIRouter(prefix="/api/vocabulary", tags=["vocabulary"])


@router.get("", response_model=VocabularyListResponse)
async def list_vocabulary(
    level: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(36, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: TursoClient = Depends(get_db),
):
    return await vocabulary_service.get_vocabulary(db, level, category, search, limit, offset)


@router.get("/categories", response_model=list[VocabCategory])
async def list_categories(db: TursoClient = Depends(get_db)):
    return await vocabulary_service.get_categories(db)


@router.get("/levels", response_model=list[VietnameseLevel])
async def list_levels(db: TursoClient = Depends(get_db)):
    return await vocabulary_service.get_levels(db)


@router.get("/{vocab_id}")
async def get_vocab(vocab_id: str, db: TursoClient = Depends(get_db)):
    item = await vocabulary_service.get_vocabulary_by_id(db, vocab_id)
    if not item:
        raise HTTPException(status_code=404, detail="Vocabulary item not found")
    return item
