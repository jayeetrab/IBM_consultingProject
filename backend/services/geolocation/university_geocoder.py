import json
import os

_geo_path = os.path.join(os.path.dirname(__file__), "uk_ireland_universities.json")

with open(_geo_path, "r") as f:
    UNI_GEO: dict = json.load(f)

UNI_LOOKUP = {name.lower(): name for name in UNI_GEO.keys()}

def get_coordinates(university_name: str) -> dict | None:
    return UNI_GEO.get(university_name)

def enrich_posts_with_geo(posts: list[dict]) -> list[dict]:
    for post in posts:
        geo_data = {}
        for uni in post.get("universities", []):
            geo = get_coordinates(uni)
            if geo:
                geo_data[uni] = geo
        post["geo_data"] = geo_data
    return posts
