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

NUM_POSTS = 1000

posts = []
for i in range(NUM_POSTS):
    cats = [
        ('AI', 'Our students just completed a hands-on workshop building LLMs with IBM Watsonx.ai! #Watsonx #IBM', 'github', 'positive'),
        ('AI', 'Fascinating guest lecture from IBM Research on the future of generative AI models and alignment.', 'devto', 'positive'),
        ('AI', 'Using IBM Granite foundation models to power our new student society chatbot. Very impressive latency.', 'hackernews', 'positive'),
        ('Data Science', 'Cleaning and analyzing enterprise datasets using IBM SPSS Modeler today. Great UI for workflows.', 'devto', 'neutral'),
        ('Data Science', 'IBM Z mainframes process 30 billion transactions a day! Mind blown during the guest tech talk. #IBMZ', 'hackernews', 'positive'),
        ('Design Thinking', 'We hosted an amazing Enterprise Design Thinking workshop led by the IBM Garage team today!', 'github', 'positive'),
        ('Design Thinking', 'Learning to frame user-centric problems using the IBM Design Thinking framework. The loops make so much sense.', 'devto', 'positive'),
        ('AI and Law', 'Exploring the ethical implications of AI governance and Watsonx.governance in legal tech at our seminar.', 'github', 'neutral'),
        ('IBM SkillsBuild', 'Just earned my Enterprise Cybersecurity badge on IBM SkillsBuild. Highly recommended curriculum!', 'devto', 'positive'),
        ('IBM SkillsBuild', 'The AI fundamentals course on IBM SkillsBuild provided a great foundation for our robotics team.', 'hackernews', 'positive'),
        ('Hackathons', 'We are hosting a 48-hour global Call for Code hackathon this weekend powered by IBM Cloud!', 'hackernews', 'positive'),
        ('Hackathons', 'Our team won 2nd place using Watson APIs at the regional hybrid cloud hackathon! #IBMCloud', 'devto', 'positive'),
        ('Open Source', 'Pushed a huge PR to the open source Qiskit repository for IBM Quantum. #Qiskit', 'github', 'positive'),
        ('Open Source', 'Contributing to the Red Hat OpenShift project today. The ecosystem is massive.', 'github', 'neutral'),
        ('Student Societies', 'The CS student society is meeting to discuss the new IBM Quantum roadmap and Qiskit 1.0.', 'devto', 'neutral'),
        ('Student Societies', 'IBM Z Ambassadors club meeting tonight: we will be covering mainframe modernization concepts.', 'github', 'positive'),
        ('Outreach Events', 'The IBM Consulting outreach team came to our campus to discuss graduate tech roles.', 'hackernews', 'positive'),
        ('Outreach Events', 'Really enjoyed the Extreme Blue internship presentation by the IBM UK team today.', 'devto', 'positive')
    ]
    cat_name, content, pltfw, default_sent = random.choice(cats)
    uni = random.choice(UNIVERSITIES)
    days_ago = random.randint(0, 30)
    
    content += f" @{uni[0].replace(' ','')}"
    
    # Use the live classifier for seeding consistency
    from backend.nlp.classifier import process_text
    nlp_stats = process_text(content)
    
    posts.append({
        "id": f"EXT_{i}_{random.randint(1000,99999)}",
        "source": pltfw,
        "text": content,
        "clean_text": content.lower(),
        "universities": [uni[0]],
        "engagement_type": nlp_stats["engagement_type"],
        "is_mock": True,
        "pipeline_version": "v2.0-seed",
        "keywords": {
            "matched_categories": [cat_name],
            "technical": ["ibm", "model", "python"] if cat_name in ["AI", "Data Science"] else ["workshop", "society"]
        },
        "sentiment": {
            "label": nlp_stats["sentiment"]["label"],
            "compound": nlp_stats["sentiment"]["score"]
        },
        "score": random.randint(10, 500),
        "created_at": datetime.utcnow() - timedelta(days=days_ago),
        "url": f"https://{pltfw}.example.com/post/{i}"
    })

async def insert_geo(posts_list):
    uni_map = {u[0]: u for u in UNIVERSITIES}
    await geo_collection.delete_many({})
    docs = []
    
    agg = {}
    for p in posts_list:
        u_name = p['universities'][0]
        e_type = p['engagement_type']
        key = (u_name, e_type)
        agg[key] = agg.get(key, 0) + 1
        
    for (u_name, e_type), count in agg.items():
        u_data = uni_map[u_name]
        docs.append({
            "university": u_name,
            "latitude": u_data[1],
            "longitude": u_data[2],
            "region": u_data[3],
            "country": u_data[4],
            "engagement_type": e_type,
            "post_count": count,
            "last_updated": datetime.utcnow()
        })
    if docs:
        await geo_collection.insert_many(docs)

async def main():
    await init_db()
    
    await posts_collection.delete_many({})
    
    await save_posts(posts)
    await insert_geo(posts)
    
    print(f"✅ Seeded {len(posts)} mock posts across {len(UNIVERSITIES)} universities into the database.")

if __name__ == "__main__":
    asyncio.run(main())
