from typing import List, Optional
from database import TursoClient
from schemas.conversation import ConversationSummary, ConversationDetail, DialogueLine


async def get_all_conversations(db: TursoClient) -> List[ConversationSummary]:
    result = await db.execute(
        "SELECT id, title_zh, title_vi, icon, badge_zh, context_zh "
        "FROM conversation_scenarios ORDER BY sort_order"
    )
    return [ConversationSummary(**row) for row in result.rows]


async def get_conversation_detail(db: TursoClient, scenario_id: str) -> Optional[ConversationDetail]:
    scenario_result = await db.execute(
        "SELECT * FROM conversation_scenarios WHERE id = ?", [scenario_id]
    )
    row = scenario_result.first()
    if not row:
        return None

    lines_result = await db.execute(
        "SELECT speaker_zh, speaker_vi, avatar, is_learner, vi, zh "
        "FROM dialogue_lines WHERE scenario_id = ? ORDER BY sort_order",
        [scenario_id],
    )
    lines = []
    for l in lines_result.rows:
        l = dict(l)
        l["is_learner"] = bool(l["is_learner"])
        lines.append(DialogueLine(**l))

    return ConversationDetail(**row, dialogue=lines)
