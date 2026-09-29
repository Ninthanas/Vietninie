from fastapi import APIRouter, Depends, Query, Request
from database import TursoClient, get_db
from schemas.placement import (
    PlacementQuestionsResponse, PlacementQuestion,
    PlacementSubmitRequest, PlacementResult, LevelScore
)
from auth import verify_token
import json
import datetime

router = APIRouter(prefix="/api/placement", tags=["placement"])


@router.get("/questions", response_model=PlacementQuestionsResponse)
async def get_questions(db: TursoClient = Depends(get_db)):
    result = await db.execute(
        "SELECT id, question_zh, options, level, sort_order "
        "FROM placement_questions ORDER BY sort_order ASC"
    )
    questions = []
    for row in result.rows:
        options = json.loads(row["options"]) if isinstance(row["options"], str) else row["options"]
        questions.append(PlacementQuestion(
            id=row["id"],
            question_zh=row["question_zh"],
            options=options,
            level=row["level"],
            sort_order=row["sort_order"],
        ))
    return PlacementQuestionsResponse(total=len(questions), questions=questions)


@router.post("/submit", response_model=PlacementResult)
async def submit_placement(
    req: PlacementSubmitRequest,
    request: Request,
    session_id: str = Query(None),
    db: TursoClient = Depends(get_db),
):
    user_id = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        payload = verify_token(auth_header.split(" ", 1)[1])
        if payload:
            user_id = payload.get("sub")

    q_result = await db.execute(
        "SELECT id, correct_index, level FROM placement_questions"
    )
    db_questions = {
        row["id"]: {"correct_index": row["correct_index"], "level": row["level"]}
        for row in q_result.rows
    }

    levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
    level_counts = {l: {"correct": 0, "total": 0} for l in levels}

    for q_data in db_questions.values():
        lvl = q_data["level"]
        if lvl in level_counts:
            level_counts[lvl]["total"] += 1

    for ans in req.answers:
        q_data = db_questions.get(ans.question_id)
        if q_data and q_data["correct_index"] == ans.selected_index:
            lvl = q_data["level"]
            if lvl in level_counts:
                level_counts[lvl]["correct"] += 1

    recommended_level = "A1"
    level_scores = []
    total_correct = 0

    for lvl in levels:
        c = level_counts[lvl]["correct"]
        t = level_counts[lvl]["total"]
        if t > 0:
            pct = round((c / t) * 100, 1)
            level_scores.append(LevelScore(level=lvl, correct=c, total=t, percentage=pct))
            total_correct += c
            if pct >= 60:
                recommended_level = lvl

    now = datetime.datetime.utcnow().isoformat()
    answers_json = json.dumps([{"q": a.question_id, "a": a.selected_index} for a in req.answers])
    scores_json = json.dumps([{"level": s.level, "correct": s.correct, "total": s.total} for s in level_scores])

    ins = await db.execute(
        "INSERT INTO placement_attempts (user_id, session_id, answers, recommended_level, score_by_level, taken_at) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        [user_id, session_id, answers_json, recommended_level, scores_json, now],
    )

    return PlacementResult(
        recommended_level=recommended_level,
        level_scores=level_scores,
        total_correct=total_correct,
        total_questions=len(db_questions),
        attempt_id=0,
    )
