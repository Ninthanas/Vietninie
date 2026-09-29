from pydantic import BaseModel
from typing import List, Optional


class DialogueLine(BaseModel):
    speaker_zh: str
    speaker_vi: str
    avatar: Optional[str] = None
    is_learner: bool = False
    vi: str
    zh: str


class ConversationSummary(BaseModel):
    id: str
    title_zh: str
    title_vi: str
    icon: Optional[str] = None
    badge_zh: Optional[str] = None
    context_zh: Optional[str] = None


class ConversationDetail(ConversationSummary):
    dialogue: List[DialogueLine] = []
