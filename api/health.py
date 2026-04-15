from fastapi import FastAPI
import httpx
import motor
import pydantic_settings

app = FastAPI()

@app.get("/api/health-test")
async def health():
    return {
        "status": "ok", 
        "message": "Dependencies loaded",
        "httpx": httpx.__version__,
        "motor": motor.version
    }
