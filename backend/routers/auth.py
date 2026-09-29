from fastapi import APIRouter, Depends, HTTPException
from database import TursoClient, get_db
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from auth import hash_password, verify_password, create_access_token, generate_user_id
from dependencies import require_auth
import re
import datetime

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: TursoClient = Depends(get_db)):
    if len(req.username) < 3 or len(req.username) > 20:
        raise HTTPException(status_code=400, detail="用户名须为3-20个字符")
    if not re.match(r"^[a-zA-Z0-9_]+$", req.username):
        raise HTTPException(status_code=400, detail="用户名只能包含字母、数字和下划线")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="密码至少6位")

    result = await db.execute("SELECT id FROM users WHERE username = ?", [req.username])
    if result.rows:
        raise HTTPException(status_code=400, detail="用户名已存在")

    user_id = generate_user_id()
    hashed = hash_password(req.password)
    now = datetime.datetime.utcnow().isoformat()

    await db.execute(
        "INSERT INTO users (id, username, password_hash, display_name, created_at, updated_at, last_login) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        [user_id, req.username, hashed, req.display_name or req.username, now, now, now],
    )

    token = create_access_token(user_id, req.username)
    return TokenResponse(
        access_token=token,
        user_id=user_id,
        username=req.username,
        display_name=req.display_name or req.username,
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: TursoClient = Depends(get_db)):
    result = await db.execute(
        "SELECT id, username, password_hash, display_name FROM users WHERE username = ?",
        [req.username],
    )
    if not result.rows:
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    row = result.rows[0]
    if not verify_password(req.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    now = datetime.datetime.utcnow().isoformat()
    await db.execute("UPDATE users SET last_login = ? WHERE id = ?", [now, row["id"]])

    token = create_access_token(row["id"], row["username"])
    return TokenResponse(
        access_token=token,
        user_id=row["id"],
        username=row["username"],
        display_name=row["display_name"],
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(require_auth), db: TursoClient = Depends(get_db)):
    result = await db.execute(
        "SELECT id, username, display_name, created_at FROM users WHERE id = ?",
        [user["sub"]],
    )
    if not result.rows:
        raise HTTPException(status_code=404, detail="用户不存在")
    row = result.rows[0]
    return UserResponse(
        user_id=row["id"],
        username=row["username"],
        display_name=row["display_name"],
        created_at=row["created_at"],
    )


@router.post("/logout")
async def logout():
    return {"ok": True}
