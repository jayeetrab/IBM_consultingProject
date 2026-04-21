import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from backend.config import settings


async def run_ingestion():
    from backend.services.ingestion.github_ingestor import fetch_github_events
    from backend.services.ingestion.devto_ingestor import fetch_devto_articles
    from backend.services.ingestion.hn_ingestor import fetch_hn_posts
    from backend.services.ingestion.reddit_ingestor import fetch_all_reddit_engagements
    from backend.services.processing.preprocessor import run_pipeline
    from backend.services.geolocation.university_geocoder import enrich_posts_with_geo
    from backend.database.db_manager import save_posts

    github_posts  = await fetch_github_events()
    devto_posts   = await fetch_devto_articles()
    hn_posts      = await fetch_hn_posts()
    reddit_posts  = await fetch_all_reddit_engagements()

    all_posts = github_posts + devto_posts + hn_posts + reddit_posts
    processed = await run_pipeline(all_posts)
    enriched  = enrich_posts_with_geo(processed)
    await save_posts(enriched)
    print(f"Ingest Complete: {len(enriched)} records saved.")


def start_scheduler():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        run_ingestion,
        trigger="interval",
        hours=settings.ingest_interval_hours,
        id="scheduled_ingest",
        replace_existing=True,
    )
    scheduler.start()
    print(f"Scheduler: Async Ingestion scheduled every {settings.ingest_interval_hours}h.")