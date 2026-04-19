import csv
import asyncio
import os
import sys
from datetime import datetime

# Add parent dir to sys.path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.db_manager import save_posts

async def inject():
    posts = []
    csv_path = '/Users/jayeetra/Documents/GitHub/IBM_consultingProject/rich_capstone_dataset.csv'
    
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Reconstruct the sentiment object expected by save_posts
            # p.get("sentiment", {}).get("compound", 0.0)
            posts.append({
                "source": row["source"],
                "id": row["id"],
                "text": row["text"],
                "universities": [u.strip() for u in row["universities"].strip("[]").replace("'", "").split(",")],
                "category": row["category"],
                "sentiment": {"label": row["sentiment"], "compound": float(row["sentiment_score"])},
                "created_at": row["created_at"],
                "geo_data": {
                    row["universities"].strip("[]").replace("'", "").split(",")[0].strip(): {
                        "lat": float(row["lat"]),
                        "lon": float(row["lon"]),
                        "region": row["region"],
                        "country": "United Kingdom"
                    }
                }
            })
            
    print(f"Injecting {len(posts)} posts into production database...")
    await save_posts(posts)
    print("Injection complete!")

if __name__ == '__main__':
    asyncio.run(inject())
