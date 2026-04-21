import os
import random
from datetime import datetime, timedelta
import asyncio

from backend.database.connection import init_db
from backend.database.db_manager import save_posts
from backend.database.connection import posts_collection, geo_collection

# The 24 UK Russell Group Universities with approximate coordinates and regions
UNIVERSITIES = [
    ("University of Birmingham", 52.4508, -1.9305, "West Midlands", "UK"),
    ("University of Bristol", 51.4584, -2.6030, "South West", "UK"),
    ("University of Cambridge", 52.2043, 0.1149, "East of England", "UK"),
    ("Cardiff University", 51.4877, -3.1783, "Wales", "UK"),
    ("Durham University", 54.7671, -1.5735, "North East", "UK"),
    ("University of Edinburgh", 55.9445, -3.1892, "Scotland", "UK"),
    ("University of Exeter", 50.7371, -3.5351, "South West", "UK"),
    ("University of Glasgow", 55.8724, -4.2900, "Scotland", "UK"),
    ("Imperial College London", 51.4988, -0.1749, "London", "UK"),
    ("King's College London", 51.5115, -0.1160, "London", "UK"),
    ("University of Leeds", 53.8067, -1.5550, "Yorkshire", "UK"),
    ("University of Liverpool", 53.4065, -2.9645, "North West", "UK"),
    ("London School of Economics", 51.5144, -0.1165, "London", "UK"),
    ("University of Manchester", 53.4668, -2.2339, "North West", "UK"),
    ("Newcastle University", 54.9783, -1.6178, "North East", "UK"),
    ("University of Nottingham", 52.9387, -1.1965, "East Midlands", "UK"),
    ("University of Oxford", 51.7548, -1.2544, "South East", "UK"),
    ("Queen Mary University of London", 51.5241, -0.0404, "London", "UK"),
    ("Queen's University Belfast", 54.5841, -5.9348, "Northern Ireland", "UK"),
    ("University of Sheffield", 53.3814, -1.4884, "Yorkshire", "UK"),
    ("University of Southampton", 50.9351, -1.3962, "South East", "UK"),
    ("University College London", 51.5246, -0.1340, "London", "UK"),
    ("University of Warwick", 52.3793, -1.5615, "West Midlands", "UK"),
    ("University of York", 53.9461, -1.0511, "Yorkshire", "UK")
]

NUM_POSTS = 500

async def generate_mock_data():
    posts = []
    categories = [
        ('AI', 'technical'),
        ('Data Science', 'technical'),
        ('Design Thinking', 'technical'),
        ('AI and Law', 'technical'),
        ('IBM SkillsBuild', 'non_technical'),
        ('Hackathons', 'technical'),
        ('Open Source', 'technical'),
        ('Student Societies', 'non_technical'),
        ('Outreach Events', 'non_technical'),
        ('Careers', 'non_technical')
    ]
    
    contents = {
        'AI': [
            'Our students just completed a hands-on workshop building LLMs with IBM Watsonx.ai! #Watsonx #IBM',
            'Fascinating guest lecture from IBM Research on the future of generative AI models and alignment.',
            'Using IBM Granite foundation models to power our new student society chatbot. Very impressive latency.'
        ],
        'Data Science': [
            'Cleaning and analyzing enterprise datasets using IBM SPSS Modeler today. Great UI for workflows.',
            'IBM Z mainframes process 30 billion transactions a day! Mind blown during the guest tech talk. #IBMZ'
        ],
        'Outreach Events': [
            'The IBM Consulting outreach team came to our campus to discuss graduate tech roles.',
            'Really enjoyed the Extreme Blue internship presentation by the IBM UK team today.'
        ]
    }
    
    platforms = ['reddit', 'github', 'devto', 'hackernews']
    sentiments = ['positive', 'neutral', 'negative']

    for i in range(NUM_POSTS):
        cat_name, engage_type = random.choice(categories)
        uni = random.choice(UNIVERSITIES)
        platform = random.choice(platforms)
        sentiment = random.choices(sentiments, weights=[0.6, 0.3, 0.1])[0]
        days_ago = random.randint(0, 30)
        
        base_content = random.choice(contents.get(cat_name, ["Exploring IBM tech and engagement potential."]))
        content = f"{base_content} @{uni[0].replace(' ','')}"
        
        posts.append({
            "id": f"MOCK_{i}_{random.randint(1000,99999)}",
            "source": platform,
            "text": content,
            "clean_text": content.lower(),
            "universities": [uni[0]],
            "category": cat_name,
            "engagement_type": engage_type,
            "is_mock": True,
            "pipeline_version": "v2.0-seed",
            "keywords": {
                "matched_categories": [cat_name],
                "technical": ["ibm", "watson", "cloud"] if engage_type == 'technical' else []
            },
            "sentiment": {
                "label": sentiment,
                "compound": 0.8 if sentiment == 'positive' else -0.5 if sentiment == 'negative' else 0.0
            },
            "score": random.randint(10, 500),
            "created_at": datetime.utcnow() - timedelta(days=days_ago),
            "url": f"https://{platform}.example.com/pulse/{i}",
            "geo_data": {
                uni[0]: {"lat": uni[1], "lon": uni[2], "region": uni[3], "country": uni[4]}
            }
        })
    return posts

async def main():
    print("🚀 Starting Seed Data Provisioning...")
    await init_db()
    
    # Clear existing data for a fresh start
    await posts_collection.delete_many({})
    await geo_collection.delete_many({})
    
    mock_posts = await generate_mock_data()
    
    # Use the existing save_posts logic which handles both posts and geo entries
    await save_posts(mock_posts)
    
    total_posts = await posts_collection.count_documents({})
    total_geo = await geo_collection.count_documents({})
    
    print(f"✅ Success! Seeded {total_posts} posts and {total_geo} geo-intelligence records.")
    print("Database is now normalized for the Intelligence Command Hub v2.0.")

if __name__ == "__main__":
    asyncio.run(main())
