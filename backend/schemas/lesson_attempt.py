from pydantic import BaseModel
from typing import Optional

class LessonAttemptRequest(BaseModel):
    quiz_score: int
    quiz_total: int
    steps_completed: int = 4
    completed: bool = True
    started_at: Optional[str] = None

class LessonAttemptResponse(BaseModel):
    id: int
    lesson_id: int
    quiz_score: int
    quiz_total: int
    completed: bool
    completed_at: Optional[str] = None
