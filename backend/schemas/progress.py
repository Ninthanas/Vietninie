from pydantic import BaseModel
from typing import Optional, List


class UserProgress(BaseModel):
    session_id: str
    current_level: str = "A1"
    streak: int = 1
    daily_goal: int = 10
    last_active_date: Optional[str] = None
    speech_rate: float = 0.9


class VocabStatus(BaseModel):
    vocab_id: str
    status: str
    last_date: Optional[str] = None
    review_count: int = 1


class UpdateLevelRequest(BaseModel):
    level: str


class UpdateDailyGoalRequest(BaseModel):
    daily_goal: int


class UpdateSpeechRateRequest(BaseModel):
    speech_rate: float


class UpdateVocabStatusRequest(BaseModel):
    status: str


class QuizScoreRecord(BaseModel):
    score: int
    total: int
    taken_at: Optional[str] = None


class ProgressStats(BaseModel):
    session_id: str
    current_level: str
    streak: int
    daily_goal: int
    last_active_date: Optional[str]
    speech_rate: float
    total_vocabulary: int
    known_words: int
    learning_words: int
    learned_today: int
    completed_lessons: int
    total_lessons: int


class ProgressExport(BaseModel):
    app: str = "Vietninie"
    version: str = "2.0"
    export_date: str
    current_level: str
    streak: int
    daily_goal: int
    completed_lessons: List[int]
    vocabulary_status: dict


class ProgressImportRequest(BaseModel):
    current_level: Optional[str] = None
    completed_lessons: Optional[List[int]] = None
    vocabulary_status: Optional[dict] = None
