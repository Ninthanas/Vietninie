from fastapi import APIRouter, Depends, HTTPException
from database import TursoClient, get_db
from schemas.progress import (
    UserProgress, UpdateLevelRequest, UpdateDailyGoalRequest,
    UpdateSpeechRateRequest, UpdateVocabStatusRequest,
    QuizScoreRecord, ProgressStats, ProgressExport, ProgressImportRequest,
)
from services import progress_service

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("/{session_id}", response_model=UserProgress)
async def get_progress(session_id: str, db: TursoClient = Depends(get_db)):
    return await progress_service.get_or_create_progress(db, session_id)


@router.get("/{session_id}/streak")
async def get_streak(session_id: str, db: TursoClient = Depends(get_db)):
    return await progress_service.get_streak(db, session_id)


@router.get("/{session_id}/stats", response_model=ProgressStats)
async def get_stats(session_id: str, db: TursoClient = Depends(get_db)):
    return await progress_service.get_stats(db, session_id)


@router.put("/{session_id}/level")
async def update_level(session_id: str, body: UpdateLevelRequest, db: TursoClient = Depends(get_db)):
    await progress_service.update_level(db, session_id, body.level)
    return {"ok": True, "level": body.level}


@router.put("/{session_id}/daily-goal")
async def update_daily_goal(session_id: str, body: UpdateDailyGoalRequest, db: TursoClient = Depends(get_db)):
    await progress_service.update_daily_goal(db, session_id, body.daily_goal)
    return {"ok": True, "daily_goal": body.daily_goal}


@router.put("/{session_id}/speech-rate")
async def update_speech_rate(session_id: str, body: UpdateSpeechRateRequest, db: TursoClient = Depends(get_db)):
    await progress_service.update_speech_rate(db, session_id, body.speech_rate)
    return {"ok": True, "speech_rate": body.speech_rate}


@router.post("/{session_id}/vocabulary/{vocab_id}")
async def set_vocab_status(
    session_id: str,
    vocab_id: str,
    body: UpdateVocabStatusRequest,
    db: TursoClient = Depends(get_db),
):
    await progress_service.set_vocab_status(db, session_id, vocab_id, body.status)
    return {"ok": True, "vocab_id": vocab_id, "status": body.status}


@router.delete("/{session_id}/vocabulary/{vocab_id}")
async def delete_vocab_status(session_id: str, vocab_id: str, db: TursoClient = Depends(get_db)):
    await progress_service.delete_vocab_status(db, session_id, vocab_id)
    return {"ok": True}


@router.post("/{session_id}/lessons/{lesson_id}/complete")
async def complete_lesson(session_id: str, lesson_id: int, db: TursoClient = Depends(get_db)):
    await progress_service.complete_lesson(db, session_id, lesson_id)
    return {"ok": True, "lesson_id": lesson_id}


@router.delete("/{session_id}/lessons/{lesson_id}")
async def undo_lesson(session_id: str, lesson_id: int, db: TursoClient = Depends(get_db)):
    await progress_service.undo_lesson(db, session_id, lesson_id)
    return {"ok": True}


@router.post("/{session_id}/quiz-scores")
async def save_quiz_score(session_id: str, body: QuizScoreRecord, db: TursoClient = Depends(get_db)):
    await progress_service.save_quiz_score(db, session_id, body.score, body.total)
    return {"ok": True}


@router.get("/{session_id}/export", response_model=ProgressExport)
async def export_progress(session_id: str, db: TursoClient = Depends(get_db)):
    return await progress_service.export_progress(db, session_id)


@router.post("/{session_id}/import")
async def import_progress(session_id: str, body: ProgressImportRequest, db: TursoClient = Depends(get_db)):
    await progress_service.import_progress(db, session_id, body)
    return {"ok": True}


@router.post("/{session_id}/reset")
async def reset_progress(session_id: str, db: TursoClient = Depends(get_db)):
    await progress_service.reset_progress(db, session_id)
    return {"ok": True, "message": "Progress reset successfully"}
