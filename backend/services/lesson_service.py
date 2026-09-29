import json
from typing import List, Optional
from database import TursoClient
from schemas.lesson import LessonSummary, LessonDetail, LessonVocabItem, LessonSentence, LessonQuizItem


async def get_all_lessons(db: TursoClient) -> List[LessonSummary]:
    result = await db.execute(
        "SELECT id, lesson_number, title_zh, title_vi, icon, duration, level, summary_zh "
        "FROM lessons ORDER BY id"
    )
    return [LessonSummary(**row) for row in result.rows]


async def get_lesson_detail(db: TursoClient, lesson_id: int) -> Optional[LessonDetail]:
    lesson_result = await db.execute("SELECT * FROM lessons WHERE id = ?", [lesson_id])
    row = lesson_result.first()
    if not row:
        return None

    vocab_result = await db.execute(
        "SELECT vi, zh, note_zh, example_vi, example_zh FROM lesson_vocab_items "
        "WHERE lesson_id = ? ORDER BY sort_order",
        [lesson_id],
    )
    sentence_result = await db.execute(
        "SELECT vi, zh, breakdown FROM lesson_sentences "
        "WHERE lesson_id = ? ORDER BY sort_order",
        [lesson_id],
    )
    quiz_result = await db.execute(
        "SELECT question, options, answer, explanation FROM lesson_quiz_items "
        "WHERE lesson_id = ? ORDER BY sort_order",
        [lesson_id],
    )

    quizzes = []
    for qrow in quiz_result.rows:
        qrow = dict(qrow)
        qrow["options"] = json.loads(qrow["options"])
        quizzes.append(LessonQuizItem(**qrow))

    return LessonDetail(
        **row,
        vocabularies=[LessonVocabItem(**v) for v in vocab_result.rows],
        sentences=[LessonSentence(**s) for s in sentence_result.rows],
        quizzes=quizzes,
    )
