from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re
import json
import os

# Initialize Vader Sentiment
analyzer = SentimentIntensityAnalyzer()

# Load University Data for NER
_geo_path = os.path.join(os.path.dirname(__file__), "../services/geolocation/uk_ireland_universities.json")
try:
    with open(_geo_path, "r") as f:
        _uni_data = json.load(f)
    UNI_NAMES = {name.lower(): name for name in _uni_data.keys()}
except Exception:
    UNI_NAMES = {}

# Common University Aliases
ALIASES = {
    "bristol": "University of Bristol",
    "oxford": "University of Oxford",
    "cambridge": "University of Cambridge",
    "imperial": "Imperial College London",
    "ucl": "University College London",
    "kcl": "King's College London",
    "lse": "London School of Economics",
    "edinburgh": "University of Edinburgh",
    "glasgow": "University of Glasgow",
    "manchester": "University of Manchester",
    "liverpool": "University of Liverpool",
    "leeds": "University of Leeds",
    "sheffield": "University of Sheffield",
    "warwick": "University of Warwick",
    "nottingham": "University of Nottingham",
    "southampton": "University of Southampton",
    "bath": "University of Bath",
    "exeter": "Exeter University",
    "newcastle": "Newcastle University",
    "durham": "Durham University",
    "tcd": "Trinity College Dublin",
    "ucd": "University College Dublin",
    "qub": "Queen's University Belfast"
}

# Technical vs Non-Technical Keywords
TECH_TERMS = {
    "ai", "artificial intelligence", "machine learning", "ml", "deep learning",
    "cloud", "quantum", "developer", "devops", "api", "data science", 
    "cybersecurity", "blockchain", "mlops", "llm", "watson", "watsonx", 
    "openshift", "kubernetes", "hackathon", "open source", "python", "java", 
    "nlp", "automation", "software engineering", "red hat", "ansible", 
    "instana", "hybrid cloud", "generative ai", "genai", "qiskit"
}

NON_TECH_TERMS = {
    "career fair", "networking", "diversity", "inclusion", "mentorship",
    "outreach", "presentation", "seminar", "recruitment", "webinar", 
    "ambassador", "society", "community", "social", "conference", "talk", 
    "event", "workshop", "graduate scheme", "career", "early professional"
}

def extract_universities(text: str) -> list[str]:
    text_lower = text.lower()
    found = set()
    
    # Check for full names
    for uni_key, uni_name in UNI_NAMES.items():
        if uni_key in text_lower:
            found.add(uni_name)
            
    # Check for aliases (ensure word boundary)
    for alias, uni_name in ALIASES.items():
        if re.search(rf"\b{alias}\b", text_lower):
            found.add(uni_name)
            
    return list(found)

def classify_engagement(text: str) -> str:
    text_lower = text.lower()
    
    has_tech = any(re.search(rf"\b{term}\b", text_lower) for term in TECH_TERMS)
    has_non_tech = any(re.search(rf"\b{term}\b", text_lower) for term in NON_TECH_TERMS)
    
    if has_tech:
        return "technical"
    if has_non_tech:
        return "non_technical"
    return "unknown"

def analyze_sentiment(text: str) -> dict:
    vs = analyzer.polarity_scores(text)
    compound = vs['compound']
    
    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"
        
    return {"label": label, "score": compound}

def process_text(text: str) -> dict:
    """
    Master NLP pipeline for standardizing text analysis.
    """
    unis = extract_universities(text)
    engagement_type = classify_engagement(text)
    sentiment = analyze_sentiment(text)
    
    return {
        "universities": unis,
        "engagement_type": engagement_type,
        "sentiment": sentiment,
        "pipeline_version": "v2.0-local-nlp"
    }
