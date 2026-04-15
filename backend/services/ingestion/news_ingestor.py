import feedparser
from datetime import datetime

QUERIES = [
    "IBM university UK hackathon",
    "IBM student developer UK Ireland",
    "IBM campus engagement UK",
    "IBM graduate scheme UK 2025"
]

def fetch_news_posts(queries: list = QUERIES) -> list[dict]:
    results = []
    seen = set()

    for query in queries:
        url = f"https://news.google.com/rss/search?q={query.replace(' ', '+')}&hl=en-GB&gl=GB&ceid=GB:en"
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:15]:
                uid = entry.get("id", entry.link)
                if uid in seen:
                    continue
                seen.add(uid)
                results.append({
                    "source": "google_news",
                    "id": uid,
                    "text": f"{entry.title} {entry.get('summary', '')}",
                    "score": 0,
                    "created_at": datetime(*entry.published_parsed[:6]) if hasattr(entry, "published_parsed") else datetime.utcnow(),
                    "url": entry.link
                })
        except Exception as e:
            print(f"[News] Error for '{query}': {e}")

    print(f"[News] Fetched {len(results)} articles")
    return results
