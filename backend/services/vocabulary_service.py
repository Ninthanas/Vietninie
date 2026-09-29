from typing import List, Optional
from database import TursoClient
from schemas.vocabulary import VocabularyItem, VocabCategory, VietnameseLevel


async def get_vocabulary(
    db: TursoClient,
    level: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 36,
    offset: int = 0,
) -> dict:
    conditions = []
    params = []

    if level and level != "ALL":
        conditions.append("level = ?")
        params.append(level)

    if category and category != "all":
        conditions.append("category = ?")
        params.append(category)

    if search:
        conditions.append("(vietnamese LIKE ? OR chinese LIKE ?)")
        q = f"%{search}%"
        params.extend([q, q])

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    count_result = await db.execute(
        f"SELECT COUNT(*) as total FROM vocabularies {where}", params
    )
    total = count_result.first()["total"] if count_result.rows else 0

    data_result = await db.execute(
        f"SELECT * FROM vocabularies {where} ORDER BY id LIMIT ? OFFSET ?",
        params + [limit, offset],
    )

    items = [VocabularyItem(**row) for row in data_result.rows]
    return {"total": total, "limit": limit, "offset": offset, "items": items}


async def get_vocabulary_by_id(db: TursoClient, vocab_id: str) -> Optional[VocabularyItem]:
    result = await db.execute("SELECT * FROM vocabularies WHERE id = ?", [vocab_id])
    row = result.first()
    return VocabularyItem(**row) if row else None


async def get_categories(db: TursoClient) -> List[VocabCategory]:
    result = await db.execute("SELECT * FROM vocab_categories ORDER BY sort_order")
    return [VocabCategory(**row) for row in result.rows]


async def get_levels(db: TursoClient) -> List[VietnameseLevel]:
    result = await db.execute("SELECT * FROM vietnamese_levels ORDER BY sort_order")
    return [VietnameseLevel(**row) for row in result.rows]
