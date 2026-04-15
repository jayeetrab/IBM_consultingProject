from fastapi import APIRouter, Query
from backend.models.schemas import TimelinePoint
from backend.database.db_manager import get_timeline_data
from typing import Optional
from datetime import date

router = APIRouter()

@router.get("/", response_model=list[TimelinePoint])
async def get_timeline(
    category: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None)
):
    return await get_timeline_data(date_from, date_to, category)
