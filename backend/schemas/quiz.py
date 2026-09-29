from pydantic import BaseModel
from typing import List, Optional


class QuizQuestion(BaseModel):
    id: str
    question_zh: str
    audio_prompt: Optional[str] = None
    options: List[str]
    correct_index: int
    explanation_zh: Optional[str] = None


class RandomQuizResponse(BaseModel):
    count: int
    questions: List[QuizQuestion]
