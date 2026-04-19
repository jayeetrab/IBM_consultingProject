# import pandas as pd # Removed to reduce bundle size
from datetime import datetime
from typing import Optional
from backend.database.connection import posts_collection, geo_collection
import re
# import google.generativeai as genai # Removed to reduce bundle size
import httpx
from backend.config import settings



async def save_posts(posts: list[dict]):
    if not posts:
        return
    
    # Motor doesn't have an easy "insert or ignore" natively without an unordered bulk write.
    # But we set a unique index on (source, external_id) so we can do an unordered insert and ignore DuplicateKeyError
    from pymongo.errors import BulkWriteError
    
    docs_to_insert = []
    geo_docs = []
    
    for p in posts:
        # Create a document for the post
        post_doc = {
            "source": p["source"],
            "external_id": str(p["id"]),
            "text": p["text"],
            "clean_text": p.get("clean_text", ""),
            "universities": p.get("universities", []),
            "keywords": p.get("keywords", {}),
            "sentiment_label": p.get("sentiment", {}).get("label", "neutral"),
            "sentiment_score": p.get("sentiment", {}).get("compound", 0.0),
            "category": p.get("category", "unknown"),
            "score": p.get("score", 0),
            "created_at": p.get("created_at", datetime.utcnow()),
            "url": p.get("url", "")
        }
        docs_to_insert.append(post_doc)
        
    if docs_to_insert:
        try:
            # unordered=True allows it to continue inserting if it hits a duplicate
            result = await posts_collection.insert_many(docs_to_insert, ordered=False)
            inserted_ids = result.inserted_ids
            
            # Now build the geo documents but we need the mongo _id
            # This is slightly tricky with bulk inserts because we only get ids for the successful ones.
            # So let's re-fetch them based on source + external_id
            
        except BulkWriteError as bwe:
             # some inserted, some duplicates. That's fine.
             pass
             
    # After bulk insert, fetch the inserted ones to create geo engagements
    # We'll fetch all matching source/ext_id pairs
    pairs = [{"source": p["source"], "external_id": str(p["id"])} for p in posts]
    cursor = posts_collection.find({"$or": pairs})
    
    # Create a mapping of (source, external_id) -> post_id
    post_map = {}
    async for db_post in cursor:
         post_map[(db_post["source"], db_post["external_id"])] = db_post["_id"]
         
    for p in posts:
        post_id = post_map.get((p["source"], str(p["id"])))
        if not post_id:
            continue
            
        for uni_name in p.get("universities", []):
            geo = p.get("geo_data", {}).get(uni_name)
            if geo:
                geo_docs.append({
                    "post_id": post_id,
                    "university": uni_name,
                    "lat": geo["lat"],
                    "lon": geo["lon"],
                    "region": geo["region"],
                    "country": geo["country"],
                    "category": p.get("category", "unknown"),
                    "sentiment": p.get("sentiment", {}).get("label", "neutral"),
                    "post_count": 1,
                    "created_at": p.get("created_at", datetime.utcnow())
                })
                
    if geo_docs:
        # Avoid duplicate geo documents for the same post_id and university
        # We didn't set a unique index here, but let's just insert them. Unordered helps.
        try:
            await geo_collection.insert_many(geo_docs, ordered=False)
        except Exception:
            pass


async def get_geo_engagements(region: Optional[str] = None, category: Optional[str] = None, date_from=None, date_to=None) -> list[dict]:
    pipeline = []
    
    match_stage: dict = {}
    if region and region != "Overall Map":
        match_stage["region"] = region
    if category and category != "Overall Map":
        match_stage["category"] = category
    if date_from or date_to:
        match_stage["last_updated"] = {}
        if date_from:
            match_stage["last_updated"]["$gte"] = datetime.combine(date_from, datetime.min.time())
        if date_to:
            match_stage["last_updated"]["$lte"] = datetime.combine(date_to, datetime.max.time())
            
    if match_stage:
        pipeline.append({"$match": match_stage})
        
    # Define the grouping key dynamically
    group_id = {
        "university": "$university",
        "latitude": "$latitude",
        "longitude": "$longitude",
        "region": "$region",
        "country": "$country"
    }
    # Only group by category if we are filtering for a specific one 
    # (actually even then, we only have one category per university in match_stage, 
    # but for "Overall Map" we want to sum them all up)
    if category and category != "Overall Map":
        group_id["category"] = "$category"
    else:
        # If overall, we return a virtual category "Overall" for display
        group_id["category"] = {"$literal": "Overall"}

    pipeline.append({
        "$group": {
            "_id": group_id,
            "post_count": {"$sum": "$post_count"},
            "avg_sentiment": {"$max": "positive"} # simplification
        }
    })
    
    cursor = geo_collection.aggregate(pipeline)
    results = []
    async for row in cursor:
        results.append({
            "university": row["_id"]["university"],
            "latitude": row["_id"]["latitude"],
            "longitude": row["_id"]["longitude"],
            "region": row["_id"]["region"],
            "country": row["_id"]["country"],
            "category": row["_id"]["category"],
            "post_count": row["post_count"],
            "avg_sentiment": row.get("avg_sentiment", "neutral")
        })
    return results


async def get_timeline_data(date_from=None, date_to=None, category=None) -> list[dict]:
    query = {}
    if category and category != "Overall Map":
        query["category"] = category
    if date_from or date_to:
        query["created_at"] = {}
        if date_from:
            query["created_at"]["$gte"] = datetime.combine(date_from, datetime.min.time())
        if date_to:
            query["created_at"]["$lte"] = datetime.combine(date_to, datetime.max.time())
            
    cursor = posts_collection.find(query, {"created_at": 1, "category": 1})
    posts = await cursor.to_list(length=None)
    
    if not posts:
        return []
        
    df_data = []
    for p in posts:
        cat = "unknown"
        if "keywords" in p and "matched_categories" in p["keywords"] and p["keywords"]["matched_categories"]:
            cat = p["keywords"]["matched_categories"][0]
        elif "category" in p:
            cat = p["category"]
            
        df_data.append({
            "date": p["created_at"].strftime("%Y-%m-%d"),
            "category": cat
        })
        
    df = pd.DataFrame(df_data)
    
    result = df.groupby(["date", "category"]).size().reset_index(name="post_count")
    return result.to_dict(orient="records")


async def get_top_universities(region=None, category=None, limit=10) -> list[dict]:
    pipeline = []
    match_stage = {}
    if region:
        match_stage["region"] = region
    if category:
        match_stage["category"] = category
        
    if match_stage:
        pipeline.append({"$match": match_stage})
        
    pipeline.extend([
        {
            "$group": {
                "_id": {
                    "university": "$university",
                    "region": "$region",
                    "category": "$category"
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
            "category": row["_id"]["category"],
            "post_count": row["post_count"]
        })
    return results


async def get_keyword_freq(category="technical") -> list[dict]:
    cursor = posts_collection.find({}, {"keywords": 1})
    freq = {}
    
    async for p in cursor:
        kw_dict = p.get("keywords", {})
        if not kw_dict:
            continue
        for kw in kw_dict.get(category, []):
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


async def get_all_posts_list() -> list[dict]:
    cursor = posts_collection.find()
    posts = await cursor.to_list(length=None)
    
    return [{
        "university": p.get("university"),
        "title": p.get("title"),
        "author": p.get("author"),
        "category": p.get("category"),
        "sentiment": p.get("sentiment_label"),
        "sentiment_score": p.get("sentiment_score"),
        "score": p.get("score"),
        "created_at": p.get("created_at"),
        "url": p.get("url")
    } for p in posts]


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


async def get_university_posts(university: str, limit: int = 20, category: Optional[str] = None) -> list:
    """Fetch raw posts specifically mentioning a given university."""
    # We do a text search or array match on 'universities'
    query: dict = {"universities": university}
    if category and category != "Overall Map":
        query["keywords.matched_categories"] = category
        
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
        total_posts = await posts_collection.count_documents({})
        
        # New Categories - checking both old schema (keywords) and new schema (category)
        def build_q(name): return {"$or": [{"keywords.matched_categories": name}, {"category": name}]}
        
        ai_posts = await posts_collection.count_documents(build_q("AI"))
        data_science_posts = await posts_collection.count_documents(build_q("Data Science"))
        design_thinking_posts = await posts_collection.count_documents(build_q("Design Thinking"))
        ai_law_posts = await posts_collection.count_documents(build_q("AI and Law"))
        skillsbuild_posts = await posts_collection.count_documents(build_q("IBM SkillsBuild"))
        hackathon_posts = await posts_collection.count_documents(build_q("Hackathons"))
        open_source_posts = await posts_collection.count_documents(build_q("Open Source"))
        society_posts = await posts_collection.count_documents(build_q("Student Societies"))
        outreach_posts = await posts_collection.count_documents(build_q("Outreach Events"))
        
        top_unis = await get_top_universities(limit=5)
        uni_context = ", ".join([f"{u['university']} ({u['post_count']} posts)" for u in top_unis]) if top_unis else "No data yet."
        
        sentiment_summary = await get_sentiment_summary()
        sentiment_context = ", ".join([f"{s['label']}: {s['count']}" for s in sentiment_summary]) if sentiment_summary else "No data yet."

        # 3. Construct Prompt Payload
        prompt = f"""You are the advanced AI assistant built for the "IBM Campus Pulse" dashboard. 
Your goal is to answer the user's query intelligently, concisely, and professionally. 
You MUST base your statistical answers strictly on the following real-time ingested data from our database:

- Total tech/strategic engagements tracked across UK/Ireland: {total_posts}
- AI & Watsonx: {ai_posts}
- Data Science & Engineering: {data_science_posts}
- Design Thinking & UX: {design_thinking_posts}
- AI & Law / Ethics: {ai_law_posts}
- IBM SkillsBuild: {skillsbuild_posts}
- Hackathons: {hackathon_posts}
- Open Source Contributions: {open_source_posts}
- Student Societies: {society_posts}
- Outreach Events: {outreach_posts}
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
