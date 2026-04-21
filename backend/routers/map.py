from fastapi import APIRouter, Query
from backend.models.schemas import GeoPoint
from backend.models.schemas import GeoPoint, TimelinePoint
from backend.database.db_manager import get_geo_engagements, get_timeline_data
from typing import Optional
from datetime import date

router = APIRouter()

@router.get("/timeline", response_model=list[TimelinePoint])
async def get_timeline(
    category: Optional[str] = Query(None),
    engagement_type: Optional[str] = Query(None),
    is_mock: Optional[bool] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None)
):
    return await get_timeline_data(
        date_from=date_from, 
        date_to=date_to, 
        category=category, 
        engagement_type=engagement_type, 
        is_mock=is_mock
    )

@router.get("/", response_model=list[GeoPoint])
async def get_map_data(
    region: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    engagement_type: Optional[str] = Query(None),
    is_mock: Optional[bool] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None)
):
    return await get_geo_engagements(
        region=region, 
        category=category, 
        engagement_type=engagement_type, 
        is_mock=is_mock, 
        date_from=date_from, 
        date_to=date_to
    )
