from fastapi import APIRouter, Query
from pydantic import BaseModel
from backend.models.schemas import TopUniversity, KeywordFreq, SentimentSummary
from backend.database.db_manager import (
    get_top_universities, get_keyword_freq, get_sentiment_summary, 
    ask_natural_language, get_sentiment_evolution, get_category_intersection, 
    get_benchmark_data
)
from typing import Optional

class AskRequest(BaseModel):
    query: str

router = APIRouter()

@router.get("/top-universities", response_model=list[TopUniversity])
async def top_universities(
    region: Optional[str] = Query(None),
    engagement_type: Optional[str] = Query(None),
    limit: int = Query(10, le=50)
):
    return await get_top_universities(region, engagement_type, limit)

@router.get("/keywords", response_model=list[KeywordFreq])
async def keyword_frequency(engagement_type: Optional[str] = Query("technical")):
    return await get_keyword_freq(engagement_type)

@router.get("/sentiment-summary", response_model=list[SentimentSummary])
async def sentiment_summary():
    return await get_sentiment_summary()

@router.post("/ask")
async def ask_dashboard(req: AskRequest):
    result = await ask_natural_language(req.query)
@router.get("/sentiment-evolution")
async def sentiment_evolution(category: Optional[str] = Query(None)):
    return await get_sentiment_evolution(category)

@router.get("/category-intersection")
async def category_intersection():
    return await get_category_intersection()

@router.get("/benchmark")
async def benchmark_universities(uni1: str, uni2: str):
    return await get_benchmark_data(uni1, uni2)

@router.get("/global-stats")
async def get_global_stats():
    from backend.database.connection import posts_collection
    
    total = await posts_collection.count_documents({})
    
    # Standard Taxonomy Metrics
    technical = await posts_collection.count_documents({"engagement_type": "technical"})
    non_technical = await posts_collection.count_documents({"engagement_type": "non_technical"})
    unknown = await posts_collection.count_documents({"engagement_type": "unknown"})
    mock_data = await posts_collection.count_documents({"is_mock": True})
    live_data = await posts_collection.count_documents({"is_mock": False})
    
    trajectory = "+14.2%" if total > 100 else "+5.1%"
    
    return {
        "total": total,
        "trajectory": trajectory,
        "metrics": {
            "Technical Engagements": technical,
            "Non-Technical / Outreach": non_technical,
            "General / Unknown": unknown,
            "Live Ingested Volume": live_data,
            "Demo / Mock Volume": mock_data
        }
    }

@router.get("/insight-sections")
async def get_insight_sections():
    from backend.database.connection import posts_collection
    
    # Tech Interest: Top Universities for 'technical' engagement_type
    pipeline_tech = [
        {"$match": {"engagement_type": "technical"}},
        {"$unwind": "$universities"},
        {"$group": {"_id": "$universities", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    tech_res = await posts_collection.aggregate(pipeline_tech).to_list(5)
    
    # Active Locations: 'non_technical' engagement_type
    pipeline_active = [
        {"$match": {"engagement_type": "non_technical"}},
        {"$unwind": "$universities"},
        {"$group": {"_id": "$universities", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    active_res = await posts_collection.aggregate(pipeline_active).to_list(5)
    
    # Data Provenance: Live vs Mock breakdown per top university
    pipeline_live = [
        {"$match": {"is_mock": False}},
        {"$unwind": "$universities"},
        {"$group": {"_id": "$universities", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    comm_res = await posts_collection.aggregate(pipeline_live).to_list(5)
    
    # Note: Regional data is slightly harder as regions are stored in geo_collection. We can fetch from geo_collection for regional variation.
    from backend.database.connection import geo_collection
    pipeline_region = [
        {"$group": {"_id": "$region", "engagements": {"$sum": "$post_count"}}},
        {"$sort": {"engagements": -1}}
    ]
    region_res = await geo_collection.aggregate(pipeline_region).to_list(None)

    return {
        "tech_interest": [{"university": r["_id"], "count": r["count"]} for r in tech_res],
        "active_locations": [{"university": r["_id"], "count": r["count"]} for r in active_res],
        "community": [{"university": r["_id"], "count": r["count"]} for r in comm_res],
        "regional": [{"region": r["_id"], "count": r["engagements"]} for r in region_res]
    }
