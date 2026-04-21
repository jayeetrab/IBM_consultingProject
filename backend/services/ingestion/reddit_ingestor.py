import httpx
import asyncio
from datetime import datetime

PRIORITY_UNIVERSITIES = [
    "University of Bristol", 
    "University of Oxford", 
    "University of Cambridge", 
    "Imperial College London", 
    "University College London", 
    "University of Manchester", 
    "University of Edinburgh"
]

async def fetch_reddit_posts(query: str, limit: int = 10) -> list[dict]:
    """
    Fetches public reddit posts via the .json search endpoint.
    No OAuth required for this 'thin' implementation.
    """
    url = f"https://www.reddit.com/search.json?q={query}&sort=new&limit={limit}"
    headers = {"User-Agent": "IBM-Campus-Pulse/2.0 (Academic Project)"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code == 429:
                print(f"[Reddit Ingest] Rate limited (429) for '{query}'")
                # In a production environment, we'd log this. For the demo, we return an empty list gracefully.
                return []
                
            response.raise_for_status()
            data = response.json()
            
            posts = []
            for child in data.get("data", {}).get("children", []):
                post_data = child.get("data", {})
                if not post_data.get("id"): continue
                
                posts.append({
                    "source": "reddit",
                    "id": post_data.get("id"),
                    "text": f"{post_data.get('title', '')} - {post_data.get('selftext', '')}",
                    "author": post_data.get("author"),
                    "url": f"https://reddit.com{post_data.get('permalink')}",
                    "created_at": datetime.fromtimestamp(post_data.get("created_utc", datetime.utcnow().timestamp())),
                    "is_mock": False
                })
            return posts
    except httpx.HTTPError as he:
        print(f"[Reddit Ingest] HTTP Error for '{query}': {he}")
        return []
    except Exception as e:
        print(f"[Reddit Ingest] Unexpected Error for '{query}': {e}")
        return []

async def fetch_all_reddit_engagements() -> list[dict]:
    """
    Orchestrates ingestion across all priority universities.
    """
    tasks = [fetch_reddit_posts(uni, limit=5) for uni in PRIORITY_UNIVERSITIES]
    results = await asyncio.gather(*tasks)
    
    # Flatten the list of lists
    return [post for sublist in results for post in sublist]
