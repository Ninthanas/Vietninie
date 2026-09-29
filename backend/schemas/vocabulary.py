from pydantic import BaseModel
from typing import Optional, List


class VocabularyItem(BaseModel):
    id: str
    vietnamese: str
    chinese: str
    example: Optional[str] = None
    example_chinese: Optional[str] = None
    level: str
    category: str
    pronunciation: Optional[str] = None


class VocabularyListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[VocabularyItem]


class VocabCategory(BaseModel):
    key: str
    name_zh: str
    icon: str


class VietnameseLevel(BaseModel):
    key: str
    name_zh: str
    name_vi: str
    desc_zh: str
