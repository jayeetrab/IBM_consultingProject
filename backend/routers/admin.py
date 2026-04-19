from fastapi import APIRouter
from backend.database.connection import audit_logs_collection

router = APIRouter()

@router.get("/audit-logs")
async def get_audit_logs():
    """
    Retrieves the system audit logs for administrative review.
    Sorted strictly by most recent first.
    """
    cursor = audit_logs_collection.find({}).sort("timestamp", -1).limit(100)
    logs = await cursor.to_list(length=100)
    
    # Clean up MongoDB ObjectId
    results = []
    for log in logs:
        log["_id"] = str(log["_id"])
        results.append(log)
        
    return results
