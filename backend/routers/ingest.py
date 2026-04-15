from fastapi import APIRouter, BackgroundTasks, UploadFile, File, HTTPException
import pandas as pd
import io
import json
from datetime import datetime
from backend.models.schemas import IngestResponse
from backend.services.processing.preprocessor import run_pipeline
from backend.services.geolocation.university_geocoder import enrich_posts_with_geo
from backend.database.db_manager import save_posts

router = APIRouter()

async def process_uploaded_data(data: list[dict]):
    """Background task to process and save uploaded data."""
    try:
        # 1. Run through ML pipeline (sentiment, category, NER)
        processed = await run_pipeline(data)
        
        # 2. Enrich with geolocation
        enriched = enrich_posts_with_geo(processed)
        
        # 3. Save to MongoDB
        await save_posts(enriched)
        print(f"[Upload] Successfully processed {len(enriched)} records.")
    except Exception as e:
        print(f"[Upload] Error processing data: {e}")

@router.post("/trigger", response_model=IngestResponse)
async def trigger_ingest(background_tasks: BackgroundTasks):
    from backend.services.scheduler import run_ingestion
    background_tasks.add_task(run_ingestion)
    return {"status": "started", "message": "Ingestion running in background"}

@router.post("/upload", response_model=IngestResponse)
async def upload_dataset(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """Upload a CSV or JSON dataset for processing."""
    if not file.filename.endswith(('.csv', '.json')):
        raise HTTPException(status_code=400, detail="Only CSV and JSON files are supported.")

    try:
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
            # Ensure required columns exist, or at least 'text'
            if 'text' not in df.columns:
                # If 'text' is missing, try to find a similar column or rename first valid object column
                text_cols = [c for c in df.columns if 'text' in c.lower() or 'content' in c.lower() or 'msg' in c.lower()]
                if text_cols:
                    df = df.rename(columns={text_cols[0]: 'text'})
                else:
                    raise HTTPException(status_code=400, detail="CSV must contain a 'text' column.")
            
            # Basic defaults for missing fields
            if 'source' not in df.columns:
                df['source'] = 'uploaded_dataset'
            if 'id' not in df.columns:
                df['id'] = [f"up_{i}_{int(datetime.now().timestamp())}" for i in range(len(df))]
            
            data = df.to_dict(orient='records')
            
        else: # JSON
            data = json.loads(contents)
            if not isinstance(data, list):
                # If it's a single object, wrap it
                data = [data]
            
            for item in data:
                if 'text' not in item:
                    raise HTTPException(status_code=400, detail="Each JSON object must contain a 'text' field.")
                if 'source' not in item:
                    item['source'] = 'uploaded_dataset'
                if 'id' not in item:
                    item['id'] = f"up_{int(datetime.now().timestamp())}"

        # Trigger background processing
        background_tasks.add_task(process_uploaded_data, data)
        
        return {
            "status": "success", 
            "message": f"File '{file.filename}' uploaded and processing started for {len(data)} records."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
