"""
Seed script: Extracts data from JS files and inserts into Turso.
Run from project root: python seed/seed_all.py
"""
import asyncio
import json
import subprocess
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from database import get_db

EXTRACT_JS = os.path.join(os.path.dirname(__file__), 'extract_data.js')
BATCH_SIZE = 50


async def seed_categories(db, categories):
    print(f"Seeding {len(categories)} categories...")
    stmts = [
        (
            "INSERT OR IGNORE INTO vocab_categories (key, name_zh, icon, sort_order) VALUES (?, ?, ?, ?)",
            [c["key"], c["nameZh"], c["icon"], i],
        )
        for i, c in enumerate(categories)
    ]
    for i in range(0, len(stmts), BATCH_SIZE):
        await db.execute_batch(stmts[i:i+BATCH_SIZE])
    print(f"  ✓ {len(categories)} categories seeded.")


async def seed_levels(db, levels):
    print(f"Seeding {len(levels)} levels...")
    stmts = [
        (
            "INSERT OR IGNORE INTO vietnamese_levels (key, name_zh, name_vi, desc_zh, sort_order) VALUES (?, ?, ?, ?, ?)",
            [l["key"], l["nameZh"], l["nameVi"], l["descZh"], i],
        )
        for i, l in enumerate(levels)
    ]
    await db.execute_batch(stmts)
    print(f"  ✓ {len(levels)} levels seeded.")


async def seed_vocabulary(db, vocab_list):
    print(f"Seeding {len(vocab_list)} vocabulary items (this may take a while)...")
    stmts = []
    for v in vocab_list:
        stmts.append((
            "INSERT OR IGNORE INTO vocabularies (id, vietnamese, chinese, example, example_chinese, level, category, pronunciation) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                v.get("id", ""),
                v.get("vietnamese", ""),
                v.get("chinese", ""),
                v.get("example", ""),
                v.get("exampleChinese", ""),
                v.get("level", "A1"),
                v.get("category", "daily"),
                v.get("pronunciation", None),
            ],
        ))

    total = len(stmts)
    inserted = 0
    for i in range(0, total, BATCH_SIZE):
        await db.execute_batch(stmts[i:i+BATCH_SIZE])
        inserted += min(BATCH_SIZE, total - i)
        pct = round(inserted / total * 100)
        print(f"\r  Vocabulary: {inserted}/{total} ({pct}%)", end="", flush=True)
    print(f"\n  ✓ {total} vocabulary items seeded.")


async def seed_lessons(db, lessons):
    print(f"Seeding {len(lessons)} lessons...")
    for lesson in lessons:
        await db.execute(
            "INSERT OR IGNORE INTO lessons (id, lesson_number, title_zh, title_vi, icon, duration, level, summary_zh) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                lesson["id"],
                lesson.get("lessonNumber", str(lesson["id"])),
                lesson.get("titleZh", ""),
                lesson.get("titleVi", ""),
                lesson.get("icon", ""),
                lesson.get("duration", ""),
                lesson.get("level", ""),
                lesson.get("summaryZh", ""),
            ],
        )
        lid = lesson["id"]

        vocab_stmts = []
        for i, v in enumerate(lesson.get("vocabularies", [])):
            vocab_stmts.append((
                "INSERT OR IGNORE INTO lesson_vocab_items (lesson_id, vi, zh, note_zh, example_vi, example_zh, sort_order) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                [lid, v.get("vi",""), v.get("zh",""), v.get("noteZh",""), v.get("exampleVi",""), v.get("exampleZh",""), i],
            ))
        if vocab_stmts:
            await db.execute_batch(vocab_stmts)

        sentence_stmts = []
        for i, s in enumerate(lesson.get("sentences", [])):
            sentence_stmts.append((
                "INSERT OR IGNORE INTO lesson_sentences (lesson_id, vi, zh, breakdown, sort_order) VALUES (?, ?, ?, ?, ?)",
                [lid, s.get("vi",""), s.get("zh",""), s.get("breakdown",""), i],
            ))
        if sentence_stmts:
            await db.execute_batch(sentence_stmts)

        quiz_stmts = []
        for i, q in enumerate(lesson.get("quizzes", [])):
            quiz_stmts.append((
                "INSERT OR IGNORE INTO lesson_quiz_items (lesson_id, question, options, answer, explanation, sort_order) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                [lid, q.get("question",""), json.dumps(q.get("options",[]), ensure_ascii=False),
                 q.get("answer", 0), q.get("explanation",""), i],
            ))
        if quiz_stmts:
            await db.execute_batch(quiz_stmts)

    print(f"  ✓ {len(lessons)} lessons seeded.")


async def seed_conversations(db, conversations):
    print(f"Seeding {len(conversations)} conversations...")
    for i, conv in enumerate(conversations):
        await db.execute(
            "INSERT OR IGNORE INTO conversation_scenarios (id, title_zh, title_vi, icon, badge_zh, context_zh, sort_order) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            [conv["id"], conv.get("titleZh",""), conv.get("titleVi",""),
             conv.get("icon",""), conv.get("badgeZh",""), conv.get("contextZh",""), i],
        )
        line_stmts = []
        for j, line in enumerate(conv.get("dialogue", [])):
            line_stmts.append((
                "INSERT OR IGNORE INTO dialogue_lines (scenario_id, speaker_zh, speaker_vi, avatar, is_learner, vi, zh, sort_order) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [conv["id"], line.get("speakerZh",""), line.get("speakerVi",""),
                 line.get("avatar",""), 1 if line.get("isLearner") else 0,
                 line.get("vi",""), line.get("zh",""), j],
            ))
        if line_stmts:
            await db.execute_batch(line_stmts)
    print(f"  ✓ {len(conversations)} conversations seeded.")


async def seed_quizzes(db, quizzes):
    print(f"Seeding {len(quizzes)} quiz questions...")
    stmts = [
        (
            "INSERT OR IGNORE INTO quiz_questions (id, question_zh, audio_prompt, options, correct_index, explanation_zh) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            [
                q.get("id",""),
                q.get("questionZh",""),
                q.get("audioPrompt", None),
                json.dumps(q.get("options",[]), ensure_ascii=False),
                q.get("correctIndex", 0),
                q.get("explanationZh",""),
            ],
        )
        for q in quizzes
    ]
    await db.execute_batch(stmts)
    print(f"  ✓ {len(quizzes)} quiz questions seeded.")


async def run():
    print("=" * 60)
    print("Vietninie — Seed Script")
    print("=" * 60)

    print("\n[1/2] Extracting data from JS files...")
    result = subprocess.run(
        ["node", EXTRACT_JS],
        capture_output=True, text=True, encoding="utf-8"
    )
    if result.returncode != 0:
        print("Node.js stderr:", result.stderr)
        print("ERROR: Failed to extract JS data.")
        sys.exit(1)

    for line in result.stderr.strip().split("\n"):
        print("  ", line)

    data = json.loads(result.stdout)
    print(f"\n  Loaded: {len(data['vocabulary'])} vocab | {len(data['lessons'])} lessons | "
          f"{len(data['conversations'])} conversations | {len(data['quizzes'])} quizzes\n")

    print("[2/2] Inserting into Turso database...")
    db = get_db()

    await seed_categories(db, data["categories"])
    await seed_levels(db, data["levels"])
    await seed_vocabulary(db, data["vocabulary"])
    await seed_lessons(db, data["lessons"])
    await seed_conversations(db, data["conversations"])
    await seed_quizzes(db, data["quizzes"])

    await db.close()
    print("\n" + "=" * 60)
    print("Seed complete!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run())
