# IBM Campus Pulse

> Geo-intelligent dashboard for mapping IBM engagement across UK & Ireland universities.

## Stack
- **Backend**: Python FastAPI
- **Frontend**: HTML5 + CSS3 (IBM Carbon tokens) + Vanilla JavaScript
- **Map**: Leaflet.js (CartoDB tiles)
- **Charts**: Chart.js v4
- **NLP**: spaCy (NER), VADER (Sentiment), custom keyword classifier
- **Data Sources**: Reddit (PRAW), Twitter/X (Tweepy)
- **Database**: SQLite (dev) / PostgreSQL (prod) via SQLAlchemy

## Setup

```bash
# 1. Clone and install dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# 2. Configure credentials
cp .env.example .env
# Edit .env with your Reddit + Twitter API keys

# 3. Run
uvicorn backend.main:app --reload --port 8000
