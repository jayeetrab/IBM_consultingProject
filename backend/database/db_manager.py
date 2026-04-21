# import pandas as pd # Removed to reduce bundle size
from datetime import datetime, timedelta
from typing import Optional, List
from backend.database.connection import posts_collection, geo_collection, audit_logs_collection
import re
import httpx
from backend.config import settings

async def save_posts(posts: List[dict]):
    if not posts:
        return
    
    from pymongo.errors import BulkWriteError
    
    docs_to_insert = []
    
    def parse_dt(dt_val):
        if not dt_val:
            return datetime.utcnow()
        if isinstance(dt_val, datetime):
            return dt_val
        if isinstance(dt_val, str):
            try:
                return datetime.fromisoformat(dt_val.replace('Z', '+00:00'))
            except Exception:
                return datetime.utcnow()
        return datetime.utcnow()

    for p in posts:
        post_doc = {
            "source": p["source"],
            "external_id": str(p["id"]),
            "text": p["text"],
            "authors": [p.get("author")] if p.get("author") else [],
            "clean_text": p.get("clean_text", ""),
            "universities": p.get("universities", []),
            "keywords": p.get("keywords", {}),
            "sentiment_label": p.get("sentiment", {}).get("label", "neutral"),
            "sentiment_score": p.get("sentiment", {}).get("compound", 0.0),
            "category": p.get("category", "unknown"),
            "engagement_type": p.get("engagement_type", "unknown"),
            "is_mock": p.get("is_mock", False),
            "pipeline_version": p.get("pipeline_version", "v2.0"),
            "score": p.get("score", 0),
            "created_at": parse_dt(p.get("created_at")),
            "url": p.get("url", "")
        }
        docs_to_insert.append(post_doc)
        
    if docs_to_insert:
        try:
            await posts_collection.insert_many(docs_to_insert, ordered=False)
        except BulkWriteError:
             pass
             
    # Fetch inserted/existing posts to create geo engagements
    pairs = [{"source": p["source"], "external_id": str(p["id"])} for p in posts]
    cursor = posts_collection.find({"$or": pairs})
    
    post_map = {}
    async for db_post in cursor:
         post_map[(db_post["source"], db_post["external_id"])] = db_post
         
    geo_docs = []
    for p in posts:
        db_post = post_map.get((p["source"], str(p["id"])))
        if not db_post:
            continue
            
        for uni_name in p.get("universities", []):
            geo = p.get("geo_data", {}).get(uni_name)
            if geo:
                geo_docs.append({
                    "post_id": db_post["_id"],
                    "university": uni_name,
                    "latitude": geo["lat"], # Standardized
                    "longitude": geo["lon"], # Standardized
                    "region": geo["region"],
                    "country": geo["country"],
                    "category": db_post.get("category", "unknown"),
                    "engagement_type": db_post.get("engagement_type", "unknown"),
                    "is_mock": db_post.get("is_mock", False),
                    "sentiment": db_post.get("sentiment_label", "neutral"),
                    "post_count": 1,
                    "last_updated": db_post.get("created_at") # Standardized timestamp
                })
                
    if geo_docs:
        try:
            await geo_collection.insert_many(geo_docs, ordered=False)
        except Exception:
            pass

async def _rebuild_geo_from_posts():
    """
    Standardizes the geo-intelligence layer by re-syncing from the raw post source.
    Useful after taxonomy updates or data cleaning.
    """
    await geo_collection.delete_many({})
    cursor = posts_collection.find()
    all_processed = []
    async for p in cursor:
        all_processed.append(p)
    
    # Batch processing would be better here, but for now we re-use logic
    from backend.services.geolocation.university_geocoder import enrich_posts_with_geo
    enriched = enrich_posts_with_geo(all_processed)
    
    geo_docs = []
    for p in enriched:
        for uni_name in p.get("universities", []):
            geo = p.get("geo_data", {}).get(uni_name)
            if geo:
                geo_docs.append({
                    "post_id": p["_id"],
                    "university": uni_name,
                    "latitude": geo["lat"],
                    "longitude": geo["lon"],
                    "region": geo["region"],
                    "country": geo["country"],
                    "category": p.get("category", "unknown"),
                    "engagement_type": p.get("engagement_type", "unknown"),
                    "is_mock": p.get("is_mock", False),
                    "sentiment": p.get("sentiment_label", "neutral"),
                    "post_count": 1,
                    "last_updated": p.get("created_at")
                })
    if geo_docs:
        await geo_collection.insert_many(geo_docs, ordered=False)
    return len(geo_docs)

async def get_geo_engagements(region: Optional[str] = None, category: Optional[str] = None, 
                             engagement_type: Optional[str] = None, is_mock: Optional[bool] = None, 
                             date_from=None, date_to=None) -> List[dict]:
    pipeline = []
    
    match_stage: dict = {}
    if region and region != "Overall Map":
        match_stage["region"] = region
    if category and category != "Overall Map":
        match_stage["category"] = category
    if engagement_type:
        match_stage["engagement_type"] = engagement_type
    if is_mock is not None:
        match_stage["is_mock"] = is_mock
        
    date_filter = {}
    if date_from:
        date_filter["$gte"] = datetime.combine(date_from, datetime.min.time())
    if date_to:
        date_filter["$lte"] = datetime.combine(date_to, datetime.max.time())
    if date_filter:
        match_stage["last_updated"] = date_filter
            
    if match_stage:
        pipeline.append({"$match": match_stage})
        
    pipeline.append({
        "$group": {
            "_id": {
                "university": "$university",
                "latitude": "$latitude",
                "longitude": "$longitude",
                "region": "$region",
                "country": "$country",
                "engagement_type": "$engagement_type"
            },
            "post_count": {"$sum": "$post_count"},
            "avg_sentiment": {"$first": "$sentiment"} # Simplification: take first for now
        }
    })
    
    cursor = geo_collection.aggregate(pipeline)
    results = []
    async for row in cursor:
        results.append({
            "university": row["_id"].get("university", "Unknown"),
            "latitude": row["_id"].get("latitude", 0.0),
            "longitude": row["_id"].get("longitude", 0.0),
            "region": row["_id"].get("region", "Unknown"),
            "country": row["_id"].get("country", "UK"),
            "category": "Overall", 
            "engagement_type": row["_id"].get("engagement_type", "unknown"),
            "post_count": row.get("post_count", 0),
            "avg_sentiment": row.get("avg_sentiment") or "neutral"
        })
    return results

async def get_timeline_data(date_from=None, date_to=None, category=None, 
                           engagement_type=None, is_mock=None) -> List[dict]:
    query = {}
    if category and category != "Overall Map":
        query["category"] = category
    if engagement_type:
        query["engagement_type"] = engagement_type
    if is_mock is not None:
        query["is_mock"] = is_mock
        
    if date_from or date_to:
        query["created_at"] = {}
        if date_from:
            query["created_at"]["$gte"] = datetime.combine(date_from, datetime.min.time())
        if date_to:
            query["created_at"]["$lte"] = datetime.combine(date_to, datetime.max.time())
            
    # We want to group by engagement_type for the React charts
    cursor = posts_collection.find(query, {"created_at": 1, "engagement_type": 1})
    from collections import defaultdict
    aggregation = defaultdict(int)
    
    async for p in cursor:
        dt = p.get("created_at", datetime.utcnow())
        date_str = dt.strftime("%Y-%m-%d")
        engage = p.get("engagement_type", "unknown")
        aggregation[(date_str, engage)] += 1
    
    result = []
    for (date_str, engage), count in aggregation.items():
        result.append({
            "date": date_str,
            "category": engage, # Alias to 'category' for frontend compat
            "engagement_type": engage,
            "post_count": count
        })
    
    result.sort(key=lambda x: x["date"])
    return result


async def get_top_universities(region=None, engagement_type=None, limit=10) -> List[dict]:
    pipeline = []
    match_stage = {}
    if region:
        match_stage["region"] = region
    if engagement_type:
        match_stage["engagement_type"] = engagement_type
        
    if match_stage:
        pipeline.append({"$match": match_stage})
        
    pipeline.extend([
        {
            "$group": {
                "_id": {
                    "university": "$university",
                    "region": "$region",
                    "engagement_type": "$engagement_type"
                },
                "post_count": {"$sum": 1}
            }
        },
        {"$sort": {"post_count": -1}},
        {"$limit": limit}
    ])
    
    cursor = geo_collection.aggregate(pipeline)
    results = []
    async for row in cursor:
        results.append({
            "university": row["_id"]["university"],
            "region": row["_id"]["region"],
            "category": row["_id"]["engagement_type"], # Compatibility
            "post_count": row["post_count"]
        })
    return results


async def get_keyword_freq(engagement_type="technical") -> List[dict]:
    # We filter by engagement_type now for better relevance
    query = {"engagement_type": engagement_type}
    cursor = posts_collection.find(query, {"keywords": 1})
    freq = {}
    
    async for p in cursor:
        kw_dict = p.get("keywords", {})
        if not kw_dict:
            continue
        # We still use the old 'technical'/'non_technical' keys inside keywords for actual terms
        key = "technical" if engagement_type == "technical" else "non_technical"
        for kw in kw_dict.get(key, []):
            freq[kw] = freq.get(kw, 0) + 1
            
    return [{"keyword": k, "count": v}
            for k, v in sorted(freq.items(), key=lambda x: -x[1])[:20]]


async def get_sentiment_summary() -> list[dict]:
    pipeline = [
        {"$group": {"_id": "$sentiment_label", "count": {"$sum": 1}}}
    ]
    cursor = posts_collection.aggregate(pipeline)
    results = []
    async for row in cursor:
        results.append({
            "label": row["_id"],
            "count": row["count"]
        })
    return results


async def get_source_breakdown() -> list[dict]:
    """Provides a distribution of data sources across the ingested pipeline."""
    pipeline = [
        {"$group": {"_id": "$source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    cursor = posts_collection.aggregate(pipeline)
    return [{"source": r["_id"], "count": r["count"]} async for r in cursor]


async def get_sentiment_evolution(category: Optional[str] = None) -> list[dict]:
    """Calculates weighted average sentiment scores over a timeline for trend regression analysis."""
    pipeline = []
    if category and category != "Overall Map":
        pipeline.append({"$match": {"category": category}})
    
    pipeline.extend([
        {
            "$group": {
                "_id": { "$dateToString": { "format": "%Y-%m-%d", "date": "$created_at" } },
                "avg_sentiment": { "$avg": "$sentiment_score" },
                "volume": { "$sum": 1 }
            }
        },
        {"$sort": {"_id": 1}}
    ])
    
    cursor = posts_collection.aggregate(pipeline)
    return [{"date": r["_id"], "score": round(r["avg_sentiment"], 3), "volume": r["volume"]} async for r in cursor]


async def get_category_intersection() -> list[dict]:
    """Analyzes cross-category technical density to identify multi-disciplinary hubs."""
    # We look for universities that lead in multiple specific categories
    pipeline = [
        {"$unwind": "$universities"},
        {
            "$group": {
                "_id": { "university": "$universities", "category": "$category" },
                "count": { "$sum": 1 }
            }
        },
        {
            "$group": {
                "_id": "$_id.university",
                "categories": {
                    "$push": { "k": "$_id.category", "v": "$count" }
                }
            }
        },
        {
            "$project": {
                "university": "$_id",
                "matrix": { "$arrayToObject": "$categories" },
                "total_breadth": { "$size": "$categories" }
            }
        },
        {"$sort": { "total_breadth": -1 }},
        {"$limit": 10}
    ]
    cursor = posts_collection.aggregate(pipeline)
    return [r async for r in cursor]


async def get_all_posts_list() -> List[dict]:
    cursor = posts_collection.find()
    posts = await cursor.to_list(length=None)
    
    results = []
    for p in posts:
        # Export each university mention as a separate row for better grouping in Excel/CSV
        unis = p.get("universities", [])
        if not unis:
            unis = ["Unknown"]
            
        for uni in unis:
            results.append({
                "university": uni,
                "text": p.get("text", "")[:200] + "..." if len(p.get("text", "")) > 200 else p.get("text", ""),
                "author": ", ".join(p.get("authors", [])),
                "engagement_type": p.get("engagement_type", "unknown"),
                "sentiment": p.get("sentiment_label", "neutral"),
                "sentiment_score": p.get("sentiment_score", 0.0),
                "is_mock": p.get("is_mock", False),
                "created_at": p.get("created_at").isoformat() if p.get("created_at") else "",
                "url": p.get("url", "")
            })
    return results


async def get_posts(category=None, region=None, limit=50) -> list:
    query = {}
    if category:
        query["category"] = category
        
    cursor = posts_collection.find(query).sort("created_at", -1).limit(limit)
    posts = await cursor.to_list(length=limit)
    
    # Motor returns _id as ObjectId, let's normalize this for JSON
    for p in posts:
        p["id"] = str(p["_id"])
        del p["_id"]
        
    return posts


async def get_benchmark_data(uni1: str, uni2: str) -> dict:
    """Provides a competitive differential matrix between two specific institutions."""
    async def get_stats(uni):
        pipeline = [
            {"$match": {"universities": uni}},
            {
                "$group": {
                    "_id": "$category",
                    "count": {"$sum": 1},
                    "avg_sentiment": {"$avg": "$sentiment_score"}
                }
            }
        ]
        cursor = posts_collection.aggregate(pipeline)
        return {r["_id"]: {"count": r["count"], "sentiment": round(r["avg_sentiment"], 3)} async for r in cursor}
    
    stats1 = await get_stats(uni1)
    stats2 = await get_stats(uni2)
    
    return {
        "uni1": {"name": uni1, "metrics": stats1},
        "uni2": {"name": uni2, "metrics": stats2}
    }


async def get_university_posts(university: str, limit: int = 25, category: str = None, engagement_type: str = None, is_mock: bool = None) -> list:
    """Fetch raw posts specifically mentioning a given university."""
    # We do a text search or array match on 'universities'
    query: dict = {"universities": university}
    if category and category != "Overall Map":
        query["category"] = category
    if engagement_type:
        query["engagement_type"] = engagement_type
    if is_mock is not None:
        query["is_mock"] = is_mock
        
    cursor = posts_collection.find(query).sort("created_at", -1).limit(limit)
    posts = await cursor.to_list(length=limit)
    
    for p in posts:
        p["id"] = str(p["_id"])
        del p["_id"]
    return posts


import time
import httpx

_query_cache = {}
CACHE_TTL = 300  # Cache for 5 minutes

async def ask_natural_language(query_text: str) -> dict:
    """
    Advanced LLM Integration: Uses Gemini 2.5 Flash to provide dynamic, intelligent answers 
    based on the real-time data from MongoDB. Protected by an in-memory cache against 429s.
    """
    if not settings.gemini_api_key or settings.gemini_api_key == "your_gemini_api_key_here":
        return {"answer": "The intelligence layer (Gemini API) is not configured. Please add your free GEMINI_API_KEY to the .env file."}
    
    query_key = query_text.strip().lower()
    
    # 1. Check LRU Cache to prevent 429 Too Many Requests
    if query_key in _query_cache:
        cached_time, cached_result = _query_cache[query_key]
        if time.time() - cached_time < CACHE_TTL:
            return {"answer": cached_result}
            
    # Clean up old cache entries if it gets too large
    if len(_query_cache) > 100:
        _query_cache.clear()

    try:
        # 2. Fetch context data from our database
        # Fetch simplified engagement context
        technical_posts = await posts_collection.count_documents({"engagement_type": "technical"})
        non_technical_posts = await posts_collection.count_documents({"engagement_type": "non_technical"})
        unknown_posts = await posts_collection.count_documents({"engagement_type": "unknown"})
        
        top_unis = await get_top_universities(limit=5)
        uni_context = ", ".join([f"{u['university']} ({u['post_count']} posts)" for u in top_unis]) if top_unis else "No data yet."
        
        sentiment_summary = await get_sentiment_summary()
        sentiment_context = ", ".join([f"{s['label']}: {s['count']}" for s in sentiment_summary]) if sentiment_summary else "No data yet."

        # 3. Construct Prompt Payload
        prompt = f"""You are the advanced AI assistant built for the "IBM Campus Pulse" dashboard. 
Your goal is to answer the user's query intelligently, concisely, and professionally. 
You MUST base your statistical answers strictly on the following real-time ingested data from our database:

- Total university engagements tracked: {total_posts}
- Technical (Coding, AI, Data, Engineering): {technical_posts}
- Non-Technical (Careers, Outreach, Societies): {non_technical_posts}
- Unknown/General: {unknown_posts}
- Top Universities by engagement volume: {uni_context}
- Overall Sentiment Distribution: {sentiment_context}

User Query: "{query_text}"

Provide a highly polished, short response formatted nicely with markdown (e.g., use bold text). Do not hallucinate numbers outside the context provided.
"""

        # 4. Request Gemini Response (Direct HTTP)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.gemini_api_key}"
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            # Extract content from Gemini response
            answer_text = data['candidates'][0]['content']['parts'][0]['text']
            
            # Save to Cache!
            _query_cache[query_key] = (time.time(), answer_text)
            
            return {"answer": answer_text}
            
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 429:
            return {"answer": "The intelligence layer is currently receiving extremely high traffic (API Quota Exceeded). Please try asking again in 1 minute."}
        return {"answer": f"System error communicating with the intelligence layer: {str(exc)}"}
    except Exception as e:
        return {"answer": f"System error communicating with the intelligence layer: {str(e)}"}
