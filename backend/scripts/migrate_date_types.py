import asyncio
import os
import sys
from datetime import datetime

# Add parent dir to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.connection import posts_collection

async def migrate():
    print("Starting Date Type Migration...")
    cursor = posts_collection.find({"created_at": {"": "string"}})
    count = 0
    async for doc in cursor:
        dt_str = doc["created_at"]
        try:
            # Try ISO format
            dt_obj = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        except Exception:
            try:
                # Try fallback YYYY-MM-DD
                dt_obj = datetime.strptime(dt_str.split()[0], "%Y-%m-%d")
            except Exception:
                dt_obj = datetime.utcnow()
        
        await posts_collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {"created_at": dt_obj}}
        )
        count += 1
    
    print(f"Migration complete! Updated {count} records to mathematical Date objects.")

if __name__ == '__main__':
    asyncio.run(migrate())
