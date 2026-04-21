import re
import asyncio

def clean_text(text: str) -> str:
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#(\w+)", r"\1", text)
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip().lower()

async def process_single_post(post: dict) -> dict:
    from backend.services.processing.ner_extractor import extract_universities
    from backend.services.processing.keyword_extractor import extract_keywords
    from backend.services.processing.hf_classifier import classify_post

    try:
        clean = clean_text(post["text"])
        universities = extract_universities(clean)
        keywords = extract_keywords(clean)
        
        # HuggingFace Zero-Shot and Sentiment pipeline
        ml_result = await classify_post(clean)

        return {
            **post,
            "clean_text": clean,
            "universities": universities,
            "keywords": keywords,
            "sentiment": ml_result["sentiment"],
            "category": ml_result["category"]
        }
    except Exception as e:
        print(f"[Pipeline] Error processing post {post.get('id')}: {e}")
        return None

async def run_pipeline(posts: list[dict]) -> list[dict]:
    # Run all ML inferences concurrently
    tasks = [process_single_post(p) for p in posts]
    processed_posts = await asyncio.gather(*tasks)
    
    # Filter out None results from errors
    return [p for p in processed_posts if p is not None]
