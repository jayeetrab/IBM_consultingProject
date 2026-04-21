import re
import asyncio


def clean_text(text: str) -> str:
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'[^\w\s.,!?\'"-]', '', text)
    text = re.sub(r'(\w)\1{3,}', r'\1', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\.{3,}', '...',  text)
    return text.strip().lower()


async def process_single_post(post: dict) -> dict:
    from backend.nlp.classifier import process_text
    from backend.services.processing.keyword_extractor import extract_keywords
    try:
        raw_text = post.get("text", "")
        clean = clean_text(raw_text)

        # Local NLP pipeline v2.0 — no Gemini/HuggingFace
        nlp_stats = process_text(clean)
        keywords = extract_keywords(clean)

        return {
            **post,
            "clean_text": clean,
            "universities": nlp_stats["universities"],
            "engagement_type": nlp_stats["engagement_type"],
            "sentiment": nlp_stats["sentiment"],
            "is_mock": post.get("is_mock", False),
            "pipeline_version": nlp_stats["pipeline_version"],
            "keywords": keywords,
            # Backward-compat: store first matched category or fall back to engagement_type
            "category": keywords.get("matched_categories", [nlp_stats["engagement_type"]])[0]
                        if keywords.get("matched_categories") else nlp_stats["engagement_type"],
        }
    except Exception as e:
        print(f"Pipeline Error processing post {post.get('id')}: {e}")
        return None


async def run_pipeline(posts: list[dict]) -> list[dict]:
    """Run all NLP inferences concurrently."""
    tasks = [process_single_post(p) for p in posts]
    processed_posts = await asyncio.gather(*tasks)
    return [p for p in processed_posts if p is not None]