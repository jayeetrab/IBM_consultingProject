import csv
import random
from datetime import datetime, timedelta

def generate():
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

    categories = [
        "AI", "Data Science", "Design Thinking", "AI and Law", 
        "IBM SkillsBuild", "Hackathons", "Open Source", "Student Societies", "Outreach Events"
    ]

    platforms = ["Reddit", "Discord", "Twitter", "Forums", "Tech Blog"]
    
    data = []
    base_date = datetime.now() - timedelta(days=60)
    
    for i in range(250):
        uni = random.choice(universities)
        cat = random.choice(categories)
        plat = random.choice(platforms)
        # Spread dates across 60 days to show trend regression
        date = base_date + timedelta(days=random.randint(0, 59), hours=random.randint(0, 23))
        
        if cat in ["AI", "Data Science", "Hackathons"]:
            sentiment = "positive" if random.random() > 0.2 else "neutral"
            score = random.uniform(0.1, 0.9)
        elif cat in ["Student Societies"]:
            sentiment = "neutral"
            score = random.uniform(-0.1, 0.2)
        else:
             sentiment = random.choice(["positive", "neutral", "negative"])
             score = random.uniform(-0.4, 0.5)
            
        data.append({
            "source": plat,
            "id": f"gen_{i}",
            "text": f"Analyzing high-performance {cat} frameworks at {uni['name']}. IBM engagement is critical.",
            "universities": [uni['name']],
            "category": cat,
            "sentiment": sentiment,
            "sentiment_score": round(score, 3),
            "created_at": date.isoformat(),
            "lat": uni['lat'],
            "lon": uni['lon'],
            "region": uni['region']
        })

    with open('/Users/jayeetra/Documents/GitHub/IBM_consultingProject/rich_capstone_dataset.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    print(f"Generated 250 records in rich_capstone_dataset.csv")

if __name__ == '__main__':
    generate()
