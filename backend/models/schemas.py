from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PostOut(BaseModel):
    id: str
    source: str
    text: str
    universities: list
    keywords: dict
    sentiment_label: str
    sentiment_score: float
    category: str
    score: int
    created_at: datetime
    url: str

    class Config:
        from_attributes = True

class GeoPoint(BaseModel):
    university: str
    latitude: float
    longitude: float
    region: str
    country: str
    category: str
    post_count: int
    avg_sentiment: str

class TimelinePoint(BaseModel):
    date: str
    category: str
    post_count: int

class TopUniversity(BaseModel):
    university: str
    region: str
    post_count: int
    category: str

class KeywordFreq(BaseModel):
    keyword: str
    count: int

class SentimentSummary(BaseModel):
    label: str
    count: int

class IngestResponse(BaseModel):
    status: str
    message: str
