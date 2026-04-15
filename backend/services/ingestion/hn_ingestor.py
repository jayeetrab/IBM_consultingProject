import httpx
from datetime import datetime
import asyncio

async def fetch_hn_posts() -> list[dict]:
    """
    Fetches recent top HN stories and formats them.
    Note HN API requires fetching the top stories list, then fetching individual items.
    """
    posts = []
    base_url = "https://hacker-news.firebaseio.com/v0"
    
    async with httpx.AsyncClient() as client:
        try:
            # Get top 20 stories
            resp = await client.get(f"{base_url}/topstories.json", timeout=10.0)
            if resp.status_code == 200:
                story_ids = resp.json()[:15]
                
                # Fetch them concurrently
                tasks = [client.get(f"{base_url}/item/{sid}.json") for sid in story_ids]
                responses = await asyncio.gather(*tasks, return_exceptions=True)
                
                for r in responses:
                    if isinstance(r, httpx.Response) and r.status_code == 200:
                        item = r.json()
                        if not item or item.get("type") != "story":
                            continue
                            
                        # Convert unix timestamp
                        dt = datetime.fromtimestamp(item.get("time", 0))
                        
                        posts.append({
                            "id": f"hn_{item['id']}",
                            "source": "hackernews",
                            "text": f"{item.get('title', '')}",
                            "url": item.get("url", f"https://news.ycombinator.com/item?id={item['id']}"),
                            "created_at": dt
                        })
        except Exception as e:
            print(f"[HN Ingest] Error: {e}")
            
    return posts
