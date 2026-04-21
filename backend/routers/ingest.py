from fastapi import APIRouter, BackgroundTasks, UploadFile, File, HTTPException
import csv
import io
import json
from datetime import datetime
from backend.models.schemas import IngestResponse
from backend.services.processing.preprocessor import run_pipeline
from backend.services.geolocation.university_geocoder import enrich_posts_with_geo
from backend.database.db_manager import save_posts

router = APIRouter()

def _is_valid(v):
    return v is not None and str(v).strip() != '' and str(v).lower() != 'nan'

async def process_uploaded_data(data: list[dict], is_ibm_open_data: bool = False):
    """Background task to process and save uploaded data."""
    try:
        if is_ibm_open_data:
            enriched = []
            for idx, item in enumerate(data):
                # Clean up invalid values
                item = {k: v for k, v in item.items() if _is_valid(v)}
                
                geo_data = {}
                uni_raw = item.get("university_canonical")
                if uni_raw:
                    unis = [u.strip() for u in str(uni_raw).split(';')]
                    for u in unis:
                        lat = item.get("latitude")
                        lon = item.get("longitude")
                        if _is_valid(lat) and _is_valid(lon):
                            try:
                                geo_data[u] = {
                                    "lat": float(lat),
                                    "lon": float(lon),
                                    "region": str(item.get("region", "Unknown")),
                                    "country": str(item.get("country", "Unknown"))
                                }
                            except ValueError:
                                pass
                
                sentiment_label = str(item.get("sentiment_label", "neutral"))
                try: sentiment_score = float(item.get("sentiment_score", 0.0))
                except: sentiment_score = 0.0
                
                tech_theme = str(item.get("tech_theme_standard", ""))
                if not _is_valid(tech_theme):
                    tech_theme = str(item.get("event_type_standard", "unknown"))
                    
                try: score = int(float(item.get("engagement_score_standardized", 0)) * 100)
                except: score = 0
                
                dt_str = item.get("created_at")
                try:
                    if _is_valid(dt_str):
                        # Simple naive parsing for safety
                        if 'T' in str(dt_str):
                            ct = datetime.fromisoformat(str(dt_str).replace('Z', '+00:00'))
                        else:
                            ct = datetime.strptime(str(dt_str).split()[0], "%Y-%m-%d")
                    else:
                        ct = datetime.utcnow()
                except:
                    ct = datetime.utcnow()
                
                text_content = str(item.get("title", "")) + " - " + str(item.get("content_text", ""))
                if text_content == " - ": 
                    text_content = str(item.get("text", "No Content"))
                
                post_doc = {
                    "source": str(item.get("source_platform", "open_dataset")),
                    "id": str(item.get("canonical_record_key", item.get("record_id", f"up_{idx}"))),
                    "text": text_content,
                    "universities": list(geo_data.keys()),
                    "geo_data": geo_data,
                    "sentiment": {"label": sentiment_label, "compound": sentiment_score},
                    "category": tech_theme,
                    "score": score,
                    "created_at": ct,
                    "url": str(item.get("source_url", ""))
                }
                enriched.append(post_doc)
        else:
            # 1. Run through ML pipeline (sentiment, category, NER)
            processed = await run_pipeline(data)
            
            # 2. Enrich with geolocation
            enriched = enrich_posts_with_geo(processed)
        
        # 3. Save to MongoDB
        await save_posts(enriched)
        print(f"[Upload] Successfully processed {len(enriched)} records.")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[Upload] Error processing data: {e}")

@router.post("/trigger", response_model=IngestResponse)
async def trigger_ingest(background_tasks: BackgroundTasks):
    from backend.services.scheduler import run_ingestion
    background_tasks.add_task(run_ingestion)
    return {"status": "started", "message": "Ingestion running in background"}

@router.post("/upload", response_model=IngestResponse)
async def upload_dataset(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """Upload a CSV, TSV, or JSON dataset for processing."""
    if not file.filename.endswith(('.csv', '.json', '.tsv')):
        raise HTTPException(status_code=400, detail="Only CSV, TSV, and JSON files are supported.")

    try:
        contents = await file.read()
        is_ibm = False
        data = []
        
        if file.filename.endswith(('.csv', '.tsv')):
            separator = '\t' if file.filename.endswith('.tsv') else ','
            
            # Parse using standard csv module
            decoded = contents.decode('utf-8')
            reader = csv.DictReader(io.StringIO(decoded), delimiter=separator)
            
            if not reader.fieldnames:
                raise HTTPException(status_code=400, detail="Empty or invalid CSV/TSV file.")
                
            fieldnames = reader.fieldnames
            
            # Detect IBM Open Data schema
            if 'canonical_record_key' in fieldnames or 'tech_theme_standard' in fieldnames:
                is_ibm = True
                data = list(reader)
            else:
                # Ensure required columns exist for old schema
                if 'text' not in fieldnames:
                    text_cols = [c for c in fieldnames if 'text' in c.lower() or 'content' in c.lower() or 'msg' in c.lower()]
                    if not text_cols:
                        raise HTTPException(status_code=400, detail="CSV must contain a 'text' column or be in IBM Open Data format.")
                    
                    # Need to rename keys for legacy data
                    for row in reader:
                        row['text'] = row.pop(text_cols[0])
                        row['source'] = row.get('source', 'uploaded_dataset')
                        row['id'] = row.get('id', f"up_{int(datetime.now().timestamp())}")
                        data.append(row)
                else:
                    for row in reader:
                        row['source'] = row.get('source', 'uploaded_dataset')
                        row['id'] = row.get('id', f"up_{int(datetime.now().timestamp())}")
                        data.append(row)
            
        else: # JSON
            data = json.loads(contents)
            if not isinstance(data, list):
                data = [data]
            
            for item in data:
                # Basic check for IBM Open Data format in JSON
                if 'canonical_record_key' in item or 'tech_theme_standard' in item:
                    is_ibm = True
                    continue
                
                if 'text' not in item:
                    raise HTTPException(status_code=400, detail="Each JSON object must contain a 'text' field.")
                if 'source' not in item:
                    item['source'] = 'uploaded_dataset'
                if 'id' not in item:
                    item['id'] = f"up_{int(datetime.now().timestamp())}"

        # Trigger background processing
        background_tasks.add_task(process_uploaded_data, data, is_ibm)
        
        schema_type = "IBM Open Dataset" if is_ibm else "Standard Pipeline"
        
        # Write to Audit Log
        from backend.database.connection import audit_logs_collection
        await audit_logs_collection.insert_one({
            "action": "dataset_upload",
            "user": "System Admin",
            "details": f"Uploaded dataset '{file.filename}' containing {len(data)} records via {schema_type}.",
            "timestamp": datetime.utcnow()
        })
        
        return {
            "status": "success", 
            "message": f"File '{file.filename}' uploaded and processing started for {len(data)} records using {schema_type}."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
