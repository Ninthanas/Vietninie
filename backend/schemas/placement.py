from pydantic import BaseModel
from typing import List, Optional

class PlacementQuestion(BaseModel):
    id: str
    question_zh: str
    options: List[str]
    level: str
    sort_order: int

class PlacementQuestionsResponse(BaseModel):
    total: int
    questions: List[PlacementQuestion]

class PlacementAnswerItem(BaseModel):
    question_id: str
    selected_index: int

class PlacementSubmitRequest(BaseModel):
    answers: List[PlacementAnswerItem]

class LevelScore(BaseModel):
    level: str
    correct: int
    total: int
    percentage: float

class PlacementResult(BaseModel):
    recommended_level: str
    level_scores: List[LevelScore]
    total_correct: int
    total_questions: int
    attempt_id: int
