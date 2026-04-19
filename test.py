import asyncio
from backend.database.connection import init_db
from backend.routers.analytics import get_insight_sections
from backend.database.db_manager import get_timeline_data

async def test():
    await init_db()
    try:
        t = await get_timeline_data()
        print("Timeline:", t[:2])
    except Exception as e:
        import traceback
        traceback.print_exc()

    try:
        i = await get_insight_sections()
        print("Insights:", i)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(test())
