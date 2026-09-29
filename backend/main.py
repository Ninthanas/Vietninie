from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import get_db

from routers import vocabulary, lessons, conversations, quizzes, progress, auth, placement


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = get_db()
    yield
    await db.close()


app = FastAPI(
    title="Vietninie API",
    description="Backend REST API cho hệ thống học tiếng Việt Vietninie (越学越辣). "
                "Cung cấp dữ liệu từ vựng 5,000 từ, 10 bài học, 7 hội thoại, 20 câu quiz và progress tracking.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vocabulary.router)
app.include_router(lessons.router)
app.include_router(conversations.router)
app.include_router(quizzes.router)
app.include_router(progress.router)
app.include_router(auth.router)
app.include_router(placement.router)


@app.get("/", tags=["root"])
async def root():
    return {
        "app": "Vietninie (越学越辣)",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "status": "running",
    }


@app.get("/health", tags=["root"])
async def health(db=None):
    try:
        db = get_db()
        result = await db.execute("SELECT 1 as ok")
        return {"status": "healthy", "db": "connected", "turso": "ok"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
