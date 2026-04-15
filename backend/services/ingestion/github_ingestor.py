import httpx
from datetime import datetime, timedelta

async def fetch_github_events() -> list[dict]:
    """
    Fetches recent public events from GitHub, searching for keywords related to IBM.
    Returns a list of standardized post dictionaries.
    """
    posts = []
    # We will search the issues and PRs explicitly for "IBM" or related tech to get high-signal data
    # GitHub Search API rate limits are 10 req/min for unauthenticated.
    url = "https://api.github.com/search/issues?q=ibm+state:open&sort=created&order=desc"
    
    headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "IBMCampusPulse"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                items = data.get("items", [])[:20] # Take top 20 recent
                
                for item in items:
                    posts.append({
                        "id": f"gh_{item['id']}",
                        "source": "github",
                        "text": f"{item['title']} - {item.get('body', '')[:200]}",
                        "url": item["html_url"],
                        "created_at": datetime.strptime(item["created_at"], "%Y-%m-%dT%H:%M:%SZ")
                    })
        except Exception as e:
            print(f"[GitHub Ingest] Error: {e}")
            
    return posts
