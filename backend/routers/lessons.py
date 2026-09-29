from fastapi import APIRouter, Depends, HTTPException
from database import TursoClient, get_db
from schemas.lesson import LessonSummary, LessonDetail
from schemas.lesson_attempt import LessonAttemptRequest, LessonAttemptResponse
from services import lesson_service, progress_service
from dependencies import require_auth
from typing import List
import datetime

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


@router.get("", response_model=List[LessonSummary])
async def list_lessons(db: TursoClient = Depends(get_db)):
    return await lesson_service.get_all_lessons(db)


@router.get("/attempts/all")
async def get_all_attempts(user: dict = Depends(require_auth), db: TursoClient = Depends(get_db)):
    user_id = user.get("sub")
    result = await db.execute(
        "SELECT id, lesson_id, quiz_score, quiz_total, completed, completed_at "
        "FROM lesson_attempts WHERE user_id = ? ORDER BY id DESC",
        [user_id],
    )
    return [
        {
            "id": row["id"],
            "lesson_id": row["lesson_id"],
            "quiz_score": row["quiz_score"],
            "quiz_total": row["quiz_total"],
            "completed": bool(row["completed"]),
            "completed_at": row["completed_at"],
        }
        for row in result.rows
    ]


@router.get("/{lesson_id}", response_model=LessonDetail)
async def get_lesson(lesson_id: int, db: TursoClient = Depends(get_db)):
    lesson = await lesson_service.get_lesson_detail(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.post("/{lesson_id}/attempt")
async def submit_attempt(
    lesson_id: int,
    req: LessonAttemptRequest,
    user: dict = Depends(require_auth),
    db: TursoClient = Depends(get_db),
):
    user_id = user.get("sub")
    now = datetime.datetime.utcnow().isoformat()
    completed = 1 if req.completed else 0

    res = await db.execute(
        "INSERT INTO lesson_attempts (user_id, lesson_id, quiz_score, quiz_total, steps_completed, completed, started_at, completed_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [user_id, lesson_id, req.quiz_score, req.quiz_total, req.steps_completed,
         completed, req.started_at or now, now if req.completed else None],
    )

    if req.completed:
        await progress_service.complete_lesson(db, user_id, lesson_id)

    return {"ok": True}


@router.get("/{lesson_id}/attempts", response_model=List[LessonAttemptResponse])
async def get_lesson_attempts(
    lesson_id: int,
    user: dict = Depends(require_auth),
    db: TursoClient = Depends(get_db),
):
    user_id = user.get("sub")
    result = await db.execute(
        "SELECT id, lesson_id, quiz_score, quiz_total, completed, completed_at "
        "FROM lesson_attempts WHERE user_id = ? AND lesson_id = ? ORDER BY id DESC",
        [user_id, lesson_id],
    )
    return [
        LessonAttemptResponse(
            id=row["id"],
            lesson_id=row["lesson_id"],
            quiz_score=row["quiz_score"],
            quiz_total=row["quiz_total"],
            completed=bool(row["completed"]),
            completed_at=row["completed_at"],
        )
        for row in result.rows
    ]
