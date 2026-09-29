from datetime import date, timedelta
from typing import Optional
from database import TursoClient
from schemas.progress import (
    UserProgress, VocabStatus, ProgressStats, ProgressExport, ProgressImportRequest
)


def _today() -> str:
    return date.today().isoformat()


async def get_or_create_progress(db: TursoClient, session_id: str) -> UserProgress:
    result = await db.execute(
        "SELECT * FROM user_progress WHERE session_id = ?", [session_id]
    )
    row = result.first()
    if row:
        return UserProgress(**row)

    today = _today()
    await db.execute(
        "INSERT INTO user_progress (session_id, current_level, streak, daily_goal, last_active_date, speech_rate, created_at, updated_at) "
        "VALUES (?, 'A1', 1, 10, ?, 0.9, ?, ?)",
        [session_id, today, today, today],
    )
    return UserProgress(session_id=session_id, last_active_date=today)


async def _update_streak(db: TursoClient, session_id: str) -> int:
    result = await db.execute(
        "SELECT streak, last_active_date FROM user_progress WHERE session_id = ?",
        [session_id],
    )
    row = result.first()
    if not row:
        return 1

    today = _today()
    last = row["last_active_date"]
    streak = row["streak"] or 1

    if last == today:
        return streak

    if last:
        last_date = date.fromisoformat(last)
        diff = (date.today() - last_date).days
        if diff == 1:
            streak += 1
        elif diff > 1:
            streak = 1

    await db.execute(
        "UPDATE user_progress SET streak = ?, last_active_date = ?, updated_at = ? WHERE session_id = ?",
        [streak, today, today, session_id],
    )
    return streak


async def update_level(db: TursoClient, session_id: str, level: str) -> None:
    await get_or_create_progress(db, session_id)
    await db.execute(
        "UPDATE user_progress SET current_level = ?, updated_at = ? WHERE session_id = ?",
        [level, _today(), session_id],
    )


async def update_daily_goal(db: TursoClient, session_id: str, goal: int) -> None:
    await get_or_create_progress(db, session_id)
    await db.execute(
        "UPDATE user_progress SET daily_goal = ?, updated_at = ? WHERE session_id = ?",
        [goal, _today(), session_id],
    )


async def update_speech_rate(db: TursoClient, session_id: str, rate: float) -> None:
    await get_or_create_progress(db, session_id)
    await db.execute(
        "UPDATE user_progress SET speech_rate = ?, updated_at = ? WHERE session_id = ?",
        [rate, _today(), session_id],
    )


async def get_streak(db: TursoClient, session_id: str) -> dict:
    await get_or_create_progress(db, session_id)
    streak = await _update_streak(db, session_id)
    return {"session_id": session_id, "streak": streak, "today": _today()}


async def set_vocab_status(
    db: TursoClient, session_id: str, vocab_id: str, status: str
) -> None:
    today = _today()
    existing = await db.execute(
        "SELECT review_count FROM vocabulary_status WHERE session_id = ? AND vocab_id = ?",
        [session_id, vocab_id],
    )
    if existing.first():
        await db.execute(
            "UPDATE vocabulary_status SET status = ?, last_date = ?, review_count = review_count + 1 "
            "WHERE session_id = ? AND vocab_id = ?",
            [status, today, session_id, vocab_id],
        )
    else:
        await db.execute(
            "INSERT INTO vocabulary_status (session_id, vocab_id, status, last_date, review_count) VALUES (?, ?, ?, ?, 1)",
            [session_id, vocab_id, status, today],
        )


async def delete_vocab_status(db: TursoClient, session_id: str, vocab_id: str) -> None:
    await db.execute(
        "DELETE FROM vocabulary_status WHERE session_id = ? AND vocab_id = ?",
        [session_id, vocab_id],
    )


async def complete_lesson(db: TursoClient, session_id: str, lesson_id: int) -> None:
    today = _today()
    existing = await db.execute(
        "SELECT 1 FROM completed_lessons WHERE session_id = ? AND lesson_id = ?",
        [session_id, lesson_id],
    )
    if not existing.first():
        await db.execute(
            "INSERT INTO completed_lessons (session_id, lesson_id, completed_at) VALUES (?, ?, ?)",
            [session_id, lesson_id, today],
        )


async def undo_lesson(db: TursoClient, session_id: str, lesson_id: int) -> None:
    await db.execute(
        "DELETE FROM completed_lessons WHERE session_id = ? AND lesson_id = ?",
        [session_id, lesson_id],
    )


async def save_quiz_score(db: TursoClient, session_id: str, score: int, total: int) -> None:
    await db.execute(
        "INSERT INTO quiz_scores (session_id, score, total, taken_at) VALUES (?, ?, ?, ?)",
        [session_id, score, total, _today()],
    )


async def get_stats(db: TursoClient, session_id: str) -> ProgressStats:
    await get_or_create_progress(db, session_id)
    streak = await _update_streak(db, session_id)

    prog = await db.execute("SELECT * FROM user_progress WHERE session_id = ?", [session_id])
    p = prog.first()

    total_vocab_r = await db.execute("SELECT COUNT(*) as c FROM vocabularies")
    total_vocab = total_vocab_r.first()["c"]

    known_r = await db.execute(
        "SELECT COUNT(*) as c FROM vocabulary_status WHERE session_id = ? AND status = 'known'",
        [session_id],
    )
    learning_r = await db.execute(
        "SELECT COUNT(*) as c FROM vocabulary_status WHERE session_id = ? AND status = 'learning'",
        [session_id],
    )
    learned_today_r = await db.execute(
        "SELECT COUNT(*) as c FROM vocabulary_status WHERE session_id = ? AND last_date = ?",
        [session_id, _today()],
    )
    completed_r = await db.execute(
        "SELECT COUNT(*) as c FROM completed_lessons WHERE session_id = ?", [session_id]
    )
    total_lessons_r = await db.execute("SELECT COUNT(*) as c FROM lessons")

    return ProgressStats(
        session_id=session_id,
        current_level=p["current_level"],
        streak=streak,
        daily_goal=p["daily_goal"],
        last_active_date=p["last_active_date"],
        speech_rate=p["speech_rate"],
        total_vocabulary=total_vocab,
        known_words=known_r.first()["c"],
        learning_words=learning_r.first()["c"],
        learned_today=learned_today_r.first()["c"],
        completed_lessons=completed_r.first()["c"],
        total_lessons=total_lessons_r.first()["c"],
    )


async def export_progress(db: TursoClient, session_id: str) -> ProgressExport:
    from datetime import datetime

    await get_or_create_progress(db, session_id)
    p_result = await db.execute("SELECT * FROM user_progress WHERE session_id = ?", [session_id])
    p = p_result.first()

    lessons_r = await db.execute(
        "SELECT lesson_id FROM completed_lessons WHERE session_id = ?", [session_id]
    )
    completed = [row["lesson_id"] for row in lessons_r.rows]

    vocab_r = await db.execute(
        "SELECT vocab_id, status, last_date, review_count FROM vocabulary_status WHERE session_id = ?",
        [session_id],
    )
    vocab_status = {
        row["vocab_id"]: {
            "status": row["status"],
            "lastDate": row["last_date"],
            "reviewCount": row["review_count"],
        }
        for row in vocab_r.rows
    }

    return ProgressExport(
        export_date=datetime.now().isoformat(),
        current_level=p["current_level"],
        streak=p["streak"],
        daily_goal=p["daily_goal"],
        completed_lessons=completed,
        vocabulary_status=vocab_status,
    )


async def import_progress(
    db: TursoClient, session_id: str, data: ProgressImportRequest
) -> None:
    await get_or_create_progress(db, session_id)
    today = _today()

    if data.current_level:
        await db.execute(
            "UPDATE user_progress SET current_level = ?, updated_at = ? WHERE session_id = ?",
            [data.current_level, today, session_id],
        )

    if data.completed_lessons is not None:
        await db.execute("DELETE FROM completed_lessons WHERE session_id = ?", [session_id])
        if data.completed_lessons:
            stmts = [
                ("INSERT OR IGNORE INTO completed_lessons (session_id, lesson_id, completed_at) VALUES (?, ?, ?)",
                 [session_id, lid, today])
                for lid in data.completed_lessons
            ]
            await db.execute_batch(stmts)

    if data.vocabulary_status is not None:
        await db.execute("DELETE FROM vocabulary_status WHERE session_id = ?", [session_id])
        if data.vocabulary_status:
            stmts = []
            for vid, vs in data.vocabulary_status.items():
                stmts.append((
                    "INSERT OR IGNORE INTO vocabulary_status (session_id, vocab_id, status, last_date, review_count) VALUES (?, ?, ?, ?, ?)",
                    [session_id, vid, vs.get("status", "known"), vs.get("lastDate", today), vs.get("reviewCount", 1)],
                ))
            await db.execute_batch(stmts)


async def reset_progress(db: TursoClient, session_id: str) -> None:
    today = _today()
    await db.execute_batch([
        ("DELETE FROM vocabulary_status WHERE session_id = ?", [session_id]),
        ("DELETE FROM completed_lessons WHERE session_id = ?", [session_id]),
        ("DELETE FROM quiz_scores WHERE session_id = ?", [session_id]),
        ("UPDATE user_progress SET current_level='A1', streak=1, daily_goal=10, last_active_date=?, updated_at=? WHERE session_id = ?",
         [today, today, session_id]),
    ])
