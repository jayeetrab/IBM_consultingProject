import asyncio
import json
import httpx
from backend.config import settings

async def classify_post(text: str) -> dict:
    """
    Runs Gemini classification using direct HTTP calls to the Gemini API (Flash 1.5).
    This avoids the heavy google-generativeai SDK to stay within Vercel's bundle limits.
    """
    if not settings.gemini_api_key:
        return {
            "category": "technical",
            "sentiment": {"label": "neutral", "compound": 0.0}
        }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.gemini_api_key}"
    
    prompt = f"""
    Analyze the following university engagement post and categorize it.
    
    Rules:
    1. Category: Must be either "technical" (coding, engineering, data, AI) or "non_technical" (social events, general news).
    2. Sentiment: Label must be "positive", "negative", or "neutral".
    3. Sentiment Compound: A float from -1.0 to 1.0.
    
    Return ONLY a valid JSON object with this structure:
    {{
        "category": "technical",
        "sentiment": {{
            "label": "positive",
            "compound": 0.8
        }}
    }}
    
    Post text: "{text}"
    """

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            # Extract content from Gemini response
            content_text = data['candidates'][0]['content']['parts'][0]['text']
            return json.loads(content_text.strip())
            
    except Exception as e:
        print(f"[Gemini Classifier] Error: {e}")
        return {
            "category": "technical",
            "sentiment": {"label": "neutral", "compound": 0.0}
        }
