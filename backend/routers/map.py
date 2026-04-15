from fastapi import APIRouter, Query
from backend.models.schemas import GeoPoint
from backend.database.db_manager import get_geo_engagements
from typing import Optional
from datetime import date

router = APIRouter()

@router.get("/", response_model=list[GeoPoint])
async def get_map_data(
    region: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None)
):
    return await get_geo_engagements(region, category, date_from, date_to)
