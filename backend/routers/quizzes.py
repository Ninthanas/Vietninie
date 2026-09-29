from fastapi import APIRouter, Depends, HTTPException, Query
from database import TursoClient, get_db
from schemas.quiz import RandomQuizResponse, QuizQuestion
from services import quiz_service

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])


@router.get("/random", response_model=RandomQuizResponse)
async def random_quiz(
    count: int = Query(10, ge=1, le=20),
    db: TursoClient = Depends(get_db),
):
    questions = await quiz_service.get_random_questions(db, count)
    return RandomQuizResponse(count=len(questions), questions=questions)


@router.get("/{question_id}", response_model=QuizQuestion)
async def get_question(question_id: str, db: TursoClient = Depends(get_db)):
    q = await quiz_service.get_question_by_id(db, question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q
