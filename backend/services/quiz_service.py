import json
import random
from typing import List, Optional
from database import TursoClient
from schemas.quiz import QuizQuestion


async def get_random_questions(db: TursoClient, count: int = 10) -> List[QuizQuestion]:
    result = await db.execute("SELECT * FROM quiz_questions ORDER BY RANDOM() LIMIT ?", [count])
    questions = []
    for row in result.rows:
        row = dict(row)
        row["options"] = json.loads(row["options"])
        questions.append(QuizQuestion(**row))
    return questions


async def get_question_by_id(db: TursoClient, question_id: str) -> Optional[QuizQuestion]:
    result = await db.execute("SELECT * FROM quiz_questions WHERE id = ?", [question_id])
    row = result.first()
    if not row:
        return None
    row = dict(row)
    row["options"] = json.loads(row["options"])
    return QuizQuestion(**row)
