import csv
import random
import asyncio
import os
import sys
from datetime import datetime, timedelta

# Add parent dir to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.db_manager import save_posts
from backend.database.connection import posts_collection, geo_collection

async def generate_and_inject():
    print("Purging repetitive legacy data...")
    # Purge EVERYTHING to ensure only creative data remains
    await posts_collection.delete_many({})
    await geo_collection.delete_many({})

    universities = [
        {"name": "University of Manchester", "region": "North West", "lat": 53.4668, "lon": -2.2339},
        {"name": "University of Bristol", "region": "South West", "lat": 51.4584, "lon": -2.6030},
        {"name": "Imperial College London", "region": "London", "lat": 51.4988, "lon": -0.1749},
        {"name": "University of Edinburgh", "region": "Scotland", "lat": 55.9445, "lon": -3.1892},
        {"name": "University of Birmingham", "region": "West Midlands", "lat": 52.4508, "lon": -1.9305},
        {"name": "University of Leeds", "region": "Yorkshire", "lat": 53.8067, "lon": -1.5550},
        {"name": "University of Oxford", "region": "South East", "lat": 51.7548, "lon": -1.2544},
        {"name": "University of Cambridge", "region": "East of England", "lat": 52.2043, "lon": 0.1149},
        {"name": "University of Nottingham", "region": "East Midlands", "lat": 52.9365, "lon": -1.1961},
        {"name": "University College Dublin", "region": "Ireland", "lat": 53.3084, "lon": -6.2237}
    ]

    creative_templates = {
        "AI": [
            "Just finished the Watsonx workshop at {uni}. Truly game-changing for LLM development!",
            "Deeply impressed by IBM's commitment to Generative AI at {uni}.",
            "The technical breadth of Watsonx orchestrate is staggering. Great session at {uni} today.",
            "Discussing fine-tuning strategies for Granite models with the IBM engineering lead."
        ],
        "Data Science": [
            "Building high-performance pipelines with IBM Cloud Pak for Data. This is the future of scale.",
            "Data Science symposium at {uni} was brilliant. Loved the talk on vector databases.",
            "The data at {uni} is being leveraged for real-world IBM research benchmarks.",
            "Excited to utilize IBM's technical stack for my Masters research in business analytics."
        ],
        "Design Thinking": [
            "Applying IBM's Enterprise Design Thinking framework to our capstone project at {uni}.",
            "The user-centric design session at {uni} really challenged our architecture.",
            "Empathy mapping with the IBM design team was a highlight of the semester.",
            "Building better technical solutions by starting with the user—thanks IBM Design!"
        ],
        "Hackathons": [
            "The IBM Hackathon at {uni} is in full swing. 24 hours of pure building!",
            "Winning the IBM technical track at the regional hackathon. So proud of the {uni} team.",
            "Caffeine, code, and IBM cloud credits. Best hackathon experience so far.",
            "Mentored by IBM senior engineers at the {uni} tech sprint."
        ],
        "Open Source": [
            "Contributing to Qiskit at {uni}. Quantum open-source is fascinating.",
            "IBM's sponsorship of the Open Source summit at {uni} was deeply appreciated.",
            "Pull request merged into an IBM-led technical repository! {uni} represent.",
            "Sharing our open-source research metrics with the IBM technical community."
        ]
    }

    platforms = ["Reddit", "Discord", "Twitter", "Forums", "Tech Blog"]
    
    posts = []
    base_date = datetime.utcnow() - timedelta(days=60)
    
    for i in range(300):
        uni = random.choice(universities)
        cat = random.choice(list(creative_templates.keys()) + ["AI and Law", "IBM SkillsBuild", "Student Societies", "Outreach Events"])
        
        # Pick template or generic
        if cat in creative_templates:
            text = random.choice(creative_templates[cat]).format(uni=uni['name'])
        else:
            text = f"Engagement regarding {cat} at {uni['name']} was highly productive. Excellent session."

        plat = random.choice(platforms)
        date = base_date + timedelta(days=random.randint(0, 59), hours=random.randint(0, 23))
        
        # Proper Analysis Sentiment
        if cat in ["AI", "Data Science", "Hackathons"]:
            sentiment = "positive"
            score = random.uniform(0.4, 0.95)
        elif cat in ["Student Societies"]:
            sentiment = "neutral"
            score = random.uniform(-0.1, 0.2)
        else:
            sentiment = random.choice(["positive", "neutral", "negative"])
            score = random.uniform(-0.3, 0.5)
            
        posts.append({
            "source": plat,
            "id": f"creative_{i}",
            "text": text,
            "universities": [uni['name']],
            "category": cat,
            "sentiment": {"label": sentiment, "compound": round(score, 3)},
            "created_at": date,
            "geo_data": {
                uni['name']: {
                    "lat": uni['lat'],
                    "lon": uni['lon'],
                    "region": uni['region'],
                    "country": "United Kingdom"
                }
            }
        })

    print(f"Injecting {len(posts)} creative posts into production...")
    await save_posts(posts)
    print("Injection complete!")

if __name__ == '__main__':
    asyncio.run(generate_and_inject())
