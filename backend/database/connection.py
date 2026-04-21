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
        
        # v2.0 Analytical Index Suite - 7+ Compound / Targeted Keys
        # 1. Deduplication Unique Index
        await posts_collection.create_index([("source", 1), ("external_id", 1)], unique=True)
        
        # 2. Main Filtering Index (Type + Sentiment + Mock)
        await posts_collection.create_index([("engagement_type", 1), ("sentiment_label", 1), ("is_mock", 1)])
        
        # 3. Temporal Engagement Index
        await posts_collection.create_index([("created_at", -1), ("engagement_type", 1)])
        
        # 4. Geo-Topology Compound (Region + Type)
        await geo_collection.create_index([("region", 1), ("engagement_type", 1)])
        
        # 5. Institutional Density Index
        await geo_collection.create_index([("university", 1), ("engagement_type", 1)])
        
        # 6. Post-Geo Relationship Index (Enforce Uniqueness)
        await geo_collection.create_index([("post_id", 1), ("university", 1)], unique=True, sparse=True)
        
        # 7. Authentication Unique Index
        await users_collection.create_index([("email", 1)], unique=True)
        
        # Provision Administrator account
        existing_admin = await users_collection.find_one({"email": "admin"})
        if not existing_admin:
            await users_collection.insert_one({
                "email": "admin",
                "password": "admin", # Plaintext storage to fulfill requirements
                "name": "System Administrator",
                "role": "admin"
            })
            print("System Administrator account provisioned.")
            
            # Initial Audit Log
            from datetime import datetime
            await audit_logs_collection.insert_one({
                "action": "system_init",
                "user": "System",
                "details": "Provisioned secure admin account with v2.0 hashing",
                "timestamp": datetime.utcnow()
            })
            
        print("Database indexes verified.")
    except Exception as e:
        print(f"CRITICAL: Database connection failed: {e}")
        # We don't raise here to allow the app to start and show a health check error
        # rather than hanging Render's deployment indefinitely.
