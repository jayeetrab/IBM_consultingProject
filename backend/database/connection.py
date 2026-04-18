from motor.motor_asyncio import AsyncIOMotorClient
from backend.config import settings

client = AsyncIOMotorClient(
    settings.mongodb_url,
    serverSelectionTimeoutMS=5000  # 5 second timeout to fail fast if DB is unreachable
)
db = client[settings.database_name]

# Collections
posts_collection = db["posts"]
geo_collection = db["geo_engagements"]
users_collection = db["users"]

async def init_db():
    print("Initializing database connection...")
    try:
        # Check connection by running a simple command
        await client.admin.command('ping')
        print("MongoDB connection successful.")
        
        # Create unique index to avoid duplicate inserts
        await posts_collection.create_index([("source", 1), ("external_id", 1)], unique=True)
        await geo_collection.create_index([("post_id", 1)])
        await users_collection.create_index([("email", 1)], unique=True)
        print("Database indexes verified.")
    except Exception as e:
        print(f"CRITICAL: Database connection failed: {e}")
        # We don't raise here to allow the app to start and show a health check error
        # rather than hanging Render's deployment indefinitely.
