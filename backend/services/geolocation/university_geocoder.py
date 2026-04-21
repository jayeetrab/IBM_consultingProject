from typing import Optional, List, Dict, Any

def get_coordinates(university_name: str) -> Optional[Dict]:
    return UNI_GEO.get(university_name)

async def get_sentiment_evolution(category: Optional[str] = None) -> List[Dict]:
    pass

def enrich_posts_with_geo(posts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    for post in posts:
        geo_data = {}
        for uni in post.get("universities", []):
            geo = get_coordinates(uni)
            if geo:
                geo_data[uni] = geo
        post["geo_data"] = geo_data
    return posts
