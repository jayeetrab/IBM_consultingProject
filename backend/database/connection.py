from motor.motor_asyncio import AsyncIOMotorClient
from backend.config import settings

client = AsyncIOMotorClient(settings.mongodb_url)
db = client[settings.database_name]

# Collections
posts_collection = db["posts"]
geo_collection = db["geo_engagements"]

async def init_db():
    # Create unique index to avoid duplicate inserts
    await posts_collection.create_index([("source", 1), ("external_id", 1)], unique=True)
    await geo_collection.create_index([("post_id", 1)])
