TECHNICAL_KEYWORDS = {
    "ai", "artificial intelligence", "machine learning", "deep learning",
    "cloud", "quantum", "quantum computing", "developer", "devops", "api",
    "data science", "cybersecurity", "blockchain", "mlops", "llm",
    "neural network", "watson", "watsonx", "openshift", "kubernetes", "hackathon",
    "open source", "python", "java", "data engineering", "nlp",
    "natural language processing", "computer vision", "automation",
    "software engineering", "internship", "placement", "graduate scheme",
    "red hat", "ansible", "instana", "mainframez", "z/os", "hybrid cloud",
    "watson studio", "granite models", "generative ai", "genai",
    # New Categories
    "ai and law", "ai & law", "tech law", "ai ethics", "skillsbuild", 
    "ibm skillsbuild", "design thinking", "open-source contributions",
    "open source contributions"
}

NON_TECHNICAL_KEYWORDS = {
    "career fair", "networking", "diversity", "inclusion", "mentorship",
    "outreach", "presentation", "seminar", "panel", "recruitment",
    "webinar", "ambassador", "society", "community", "social",
    "conference", "talk", "event", "workshop", "graduate", "career",
    "early professional", "ibm consult", "student society", "student societies",
    "outreach event", "outreach events"
}

def extract_keywords(text: str) -> dict:
    tokens = set(text.lower().split())
    words = text.lower()
    bigrams = {f"{a} {b}" for a, b in zip(text.lower().split(), text.lower().split()[1:])}
    trigrams = {f"{a} {b} {c}" for a, b, c in zip(
        text.lower().split(), text.lower().split()[1:], text.lower().split()[2:]
    )}
    all_tokens = tokens | bigrams | trigrams

    technical = list(TECHNICAL_KEYWORDS & all_tokens)
    non_technical = list(NON_TECHNICAL_KEYWORDS & all_tokens)
    
    # Advanced logic to bucket explicitly into the highly-requested tracks
    categories = {
        "AI": bool({"ai", "artificial intelligence", "machine learning", "deep learning", "watson", "watsonx", "generative ai"} & all_tokens),
        "Data Science": bool({"data science", "data engineering", "analytics", "nlp"} & all_tokens),
        "Design Thinking": bool({"design thinking", "user experience", "ux"} & all_tokens),
        "AI and Law": bool({"ai and law", "ai & law", "tech law", "ai ethics"} & all_tokens),
        "IBM SkillsBuild": bool({"skillsbuild", "ibm skillsbuild", "learning courses"} & all_tokens),
        "Hackathons": bool({"hackathon", "hackathons"} & all_tokens),
        "Open Source": bool({"open source", "open-source", "contributions", "open-source contributions"} & all_tokens),
        "Student Societies": bool({"society", "community", "social", "student society"} & all_tokens),
        "Outreach Events": bool({"outreach", "outreach event", "outreach events", "career fair"} & all_tokens)
    }

    # Generate a dynamic `specific_categories` dictionary that feeds into our dashboard maps and charts
    matched_categories = [k for k, v in categories.items() if v]
    
    return {
        "technical": technical, 
        "non_technical": non_technical,
        "matched_categories": matched_categories
    }
