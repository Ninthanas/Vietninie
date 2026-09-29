import sys
import os
import asyncio

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from database import get_db

async def run_migration():
    db = get_db()
    
    queries = [
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            display_name TEXT,
            created_at TEXT,
            updated_at TEXT,
            last_login TEXT
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS lesson_attempts (
            id INTEGER PRIMARY KEY,
            user_id TEXT NOT NULL,
            lesson_id INTEGER NOT NULL,
            quiz_score INTEGER DEFAULT 0,
            quiz_total INTEGER DEFAULT 0,
            steps_completed INTEGER DEFAULT 4,
            completed INTEGER DEFAULT 1,
            started_at TEXT,
            completed_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS placement_questions (
            id TEXT PRIMARY KEY,
            question_zh TEXT NOT NULL,
            audio_prompt TEXT,
            options TEXT NOT NULL,
            correct_index INTEGER NOT NULL,
            explanation_zh TEXT,
            level TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS placement_attempts (
            id INTEGER PRIMARY KEY,
            user_id TEXT,
            session_id TEXT,
            answers TEXT NOT NULL,
            recommended_level TEXT NOT NULL,
            score_by_level TEXT NOT NULL,
            taken_at TEXT
        );
        """,
        "CREATE INDEX IF NOT EXISTS idx_lesson_attempts_user ON lesson_attempts(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_placement_questions_level ON placement_questions(level);",
        "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);"
    ]
    
    for q in queries:
        try:
            await db.execute(q)
            print("Executed:", q.strip().split('\n')[0][:50] + "...")
        except Exception as e:
            print("Error executing:", e)
            
    await db.close()

if __name__ == "__main__":
    asyncio.run(run_migration())
