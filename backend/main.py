import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Add parent directory to path so 'backend.xxx' imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from backend.database.connection import init_db
from backend.services.scheduler import start_scheduler
from backend.routers import posts, map, timeline, analytics, export, ingest

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    # Only start scheduler if not on Vercel
    if not os.environ.get("VERCEL"):
        start_scheduler()
    yield

app = FastAPI(
    title="IBM Campus Pulse API",
    description="Geo-intelligent dashboard for IBM university engagement across UK & Ireland.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(posts.router,     prefix="/api/posts",     tags=["Posts"])
app.include_router(map.router,       prefix="/api/map",       tags=["Map"])
app.include_router(timeline.router,  prefix="/api/timeline",  tags=["Timeline"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(export.router,    prefix="/api/export",    tags=["Export"])
app.include_router(ingest.router,    prefix="/api/ingest",    tags=["Ingestion"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "environment": "vercel" if os.environ.get("VERCEL") else "local"}
