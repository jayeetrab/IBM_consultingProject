from fastapi import APIRouter, Query
from backend.models.schemas import PostOut
from backend.database.db_manager import get_posts, get_university_posts
from typing import Optional

router = APIRouter()

@router.get("/", response_model=list[PostOut])
async def list_posts(
    category: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    limit: int = Query(50, le=200)
):
    return await get_posts(category=category, region=region, limit=limit)

@router.get("/university/{university}", response_model=list[PostOut])
async def list_university_posts(
    university: str,
    category: Optional[str] = Query(None),
    limit: int = Query(20, le=100)
):
    return await get_university_posts(university=university, limit=limit, category=category)
