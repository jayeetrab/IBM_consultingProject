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
audit_logs_collection = db["audit_logs"]

async def init_db():
    print("Initializing database connection...")
    try:
        # Check connection by running a simple command
        await client.admin.command('ping')
        print("MongoDB connection successful.")
        
        # Create analytical indexes for performance
        await posts_collection.create_index([("source", 1), ("external_id", 1)], unique=True)
        await posts_collection.create_index([("engagement_type", 1)])
        await posts_collection.create_index([("is_mock", 1)])
        await posts_collection.create_index([("created_at", -1)])
        
        await geo_collection.create_index([("post_id", 1)])
        await geo_collection.create_index([("engagement_type", 1)])
        await geo_collection.create_index([("region", 1)])
        
        await users_collection.create_index([("email", 1)], unique=True)
        
        # Hardcode plaintext Administrator account logic
        existing_admin = await users_collection.find_one({"email": "admin"})
        if not existing_admin:
            await users_collection.insert_one({
                "email": "admin",
                "password": "admin",
                "name": "System Administrator"
            })
            print("System Administrator plaintext account provisioned.")
            
            # Initial Audit Log
            from datetime import datetime
            await audit_logs_collection.insert_one({
                "action": "system_init",
                "user": "System",
                "details": "Provisioned plaintext admin account",
                "timestamp": datetime.utcnow()
            })
            
        print("Database indexes verified.")
    except Exception as e:
        print(f"CRITICAL: Database connection failed: {e}")
        # We don't raise here to allow the app to start and show a health check error
        # rather than hanging Render's deployment indefinitely.
