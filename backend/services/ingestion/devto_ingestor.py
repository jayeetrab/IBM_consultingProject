import httpx
from datetime import datetime

async def fetch_devto_articles() -> list[dict]:
    """
    Fetches recent articles from Dev.to concerning tech associated with IBM, AI, or Cloud.
    Returns a list of standardized post dictionaries.
    """
    posts = []
    url = "https://dev.to/api/articles"
    # Dev.to allows querying by tags
    tags = ["ibm", "ai", "cloud", "python", "machinelearning"]
    
    async with httpx.AsyncClient() as client:
        try:
            for tag in tags[:2]: # limit to 2 tags to avoid slow fetching
                params = {"tag": tag, "top": 1, "per_page": 10}
                response = await client.get(url, params=params, timeout=10.0)
                if response.status_code == 200:
                    articles = response.json()
                    for art in articles:
                        dt = datetime.strptime(art["published_timestamp"], "%Y-%m-%dT%H:%M:%SZ")
                        posts.append({
                            "id": f"devto_{art['id']}",
                            "source": "devto",
                            "text": f"{art['title']} - {art.get('description', '')}",
                            "url": art["url"],
                            "created_at": dt
                        })
        except Exception as e:
            print(f"[Dev.to Ingest] Error: {e}")
            
    return posts
