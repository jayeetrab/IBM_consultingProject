from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_map_endpoint():
    res = client.get("/api/map/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_timeline_endpoint():
    res = client.get("/api/timeline/")
    assert res.status_code == 200

def test_analytics_top_unis():
    res = client.get("/api/analytics/top-universities")
    assert res.status_code == 200

def test_analytics_keywords():
    res = client.get("/api/analytics/keywords")
    assert res.status_code == 200

def test_analytics_sentiment():
    res = client.get("/api/analytics/sentiment-summary")
    assert res.status_code == 200

def test_export_csv():
    res = client.get("/api/export/csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
