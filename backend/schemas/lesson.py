from pydantic import BaseModel
from typing import List, Optional


class LessonVocabItem(BaseModel):
    vi: str
    zh: str
    note_zh: Optional[str] = None
    example_vi: Optional[str] = None
    example_zh: Optional[str] = None


class LessonSentence(BaseModel):
    vi: str
    zh: str
    breakdown: Optional[str] = None


class LessonQuizItem(BaseModel):
    question: str
    options: List[str]
    answer: int
    explanation: Optional[str] = None


class LessonSummary(BaseModel):
    id: int
    lesson_number: str
    title_zh: str
    title_vi: str
    icon: Optional[str] = None
    duration: Optional[str] = None
    level: Optional[str] = None
    summary_zh: Optional[str] = None


class LessonDetail(LessonSummary):
    vocabularies: List[LessonVocabItem] = []
    sentences: List[LessonSentence] = []
    quizzes: List[LessonQuizItem] = []
