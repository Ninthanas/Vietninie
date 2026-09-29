"""
Migration: Create all tables in Turso.
Run: python migrations/create_tables.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from database import get_db

TABLES = [
    """CREATE TABLE IF NOT EXISTS vocabularies (
        id TEXT PRIMARY KEY,
        vietnamese TEXT NOT NULL,
        chinese TEXT NOT NULL,
        example TEXT,
        example_chinese TEXT,
        level TEXT NOT NULL,
        category TEXT NOT NULL,
        pronunciation TEXT
    )""",

    """CREATE TABLE IF NOT EXISTS vocab_categories (
        key TEXT PRIMARY KEY,
        name_zh TEXT NOT NULL,
        icon TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
    )""",

    """CREATE TABLE IF NOT EXISTS vietnamese_levels (
        key TEXT PRIMARY KEY,
        name_zh TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        desc_zh TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
    )""",

    """CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY,
        lesson_number TEXT NOT NULL,
        title_zh TEXT NOT NULL,
        title_vi TEXT NOT NULL,
        icon TEXT,
        duration TEXT,
        level TEXT,
        summary_zh TEXT
    )""",

    """CREATE TABLE IF NOT EXISTS lesson_vocab_items (
        id INTEGER PRIMARY KEY,
        lesson_id INTEGER NOT NULL,
        vi TEXT NOT NULL,
        zh TEXT NOT NULL,
        note_zh TEXT,
        example_vi TEXT,
        example_zh TEXT,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    )""",

    """CREATE TABLE IF NOT EXISTS lesson_sentences (
        id INTEGER PRIMARY KEY,
        lesson_id INTEGER NOT NULL,
        vi TEXT NOT NULL,
        zh TEXT NOT NULL,
        breakdown TEXT,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    )""",

    """CREATE TABLE IF NOT EXISTS lesson_quiz_items (
        id INTEGER PRIMARY KEY,
        lesson_id INTEGER NOT NULL,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        answer INTEGER NOT NULL,
        explanation TEXT,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    )""",

    """CREATE TABLE IF NOT EXISTS conversation_scenarios (
        id TEXT PRIMARY KEY,
        title_zh TEXT NOT NULL,
        title_vi TEXT NOT NULL,
        icon TEXT,
        badge_zh TEXT,
        context_zh TEXT,
        sort_order INTEGER DEFAULT 0
    )""",

    """CREATE TABLE IF NOT EXISTS dialogue_lines (
        id INTEGER PRIMARY KEY,
        scenario_id TEXT NOT NULL,
        speaker_zh TEXT NOT NULL,
        speaker_vi TEXT NOT NULL,
        avatar TEXT,
        is_learner INTEGER DEFAULT 0,
        vi TEXT NOT NULL,
        zh TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (scenario_id) REFERENCES conversation_scenarios(id)
    )""",

    """CREATE TABLE IF NOT EXISTS quiz_questions (
        id TEXT PRIMARY KEY,
        question_zh TEXT NOT NULL,
        audio_prompt TEXT,
        options TEXT NOT NULL,
        correct_index INTEGER NOT NULL,
        explanation_zh TEXT
    )""",

    """CREATE TABLE IF NOT EXISTS user_progress (
        session_id TEXT PRIMARY KEY,
        current_level TEXT DEFAULT 'A1',
        streak INTEGER DEFAULT 1,
        daily_goal INTEGER DEFAULT 10,
        last_active_date TEXT,
        speech_rate REAL DEFAULT 0.9,
        created_at TEXT,
        updated_at TEXT
    )""",

    """CREATE TABLE IF NOT EXISTS vocabulary_status (
        session_id TEXT NOT NULL,
        vocab_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'learning',
        last_date TEXT,
        review_count INTEGER DEFAULT 1,
        PRIMARY KEY (session_id, vocab_id)
    )""",

    """CREATE TABLE IF NOT EXISTS completed_lessons (
        session_id TEXT NOT NULL,
        lesson_id INTEGER NOT NULL,
        completed_at TEXT,
        PRIMARY KEY (session_id, lesson_id)
    )""",

    """CREATE TABLE IF NOT EXISTS quiz_scores (
        id INTEGER PRIMARY KEY,
        session_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        taken_at TEXT
    )""",
]

INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_vocab_level ON vocabularies(level)",
    "CREATE INDEX IF NOT EXISTS idx_vocab_category ON vocabularies(category)",
    "CREATE INDEX IF NOT EXISTS idx_vocab_status_session ON vocabulary_status(session_id)",
    "CREATE INDEX IF NOT EXISTS idx_completed_lessons_session ON completed_lessons(session_id)",
    "CREATE INDEX IF NOT EXISTS idx_quiz_scores_session ON quiz_scores(session_id)",
]


async def run():
    db = get_db()
    print("Connecting to Turso...")

    all_stmts = [(sql, None) for sql in TABLES + INDEXES]
    # Turso pipeline: batch up to 25 at a time
    batch_size = 20
    total = 0
    for i in range(0, len(all_stmts), batch_size):
        batch = all_stmts[i:i+batch_size]
        await db.execute_batch(batch)
        total += len(batch)
        print(f"  Executed {total}/{len(all_stmts)} statements...")

    print(f"Migration complete: {len(TABLES)} tables + {len(INDEXES)} indexes created.")
    await db.close()


if __name__ == "__main__":
    asyncio.run(run())
