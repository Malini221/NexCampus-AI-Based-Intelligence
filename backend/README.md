# NexCampus FastAPI backend

This service implements the backend/orchestration layer described in the NexCampus architecture: authenticated complaint creation, complaint retrieval, semantic embeddings with Sentence-BERT, pgvector similarity matching, incident creation/linking, safety-first severity/priority analysis, and staff status updates.

## Setup

From `backend/`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Set these values in `.env`:

```text
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
EMBEDDING_MODEL=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
SIMILARITY_THRESHOLD=0.78
CORS_ORIGINS=http://localhost:3000
```

Never put `SUPABASE_SERVICE_ROLE_KEY` in the React/Vite frontend or commit the `.env` file.

## Run

```powershell
uvicorn app.main:app --reload --port 8000
```

Open `http://localhost:8000/docs` for the interactive API documentation.

## Flow

`React → Supabase Auth token → FastAPI → Supabase/PostgreSQL → Sentence-BERT → pgvector → incident matching → AI analysis/status → React`

The classifier currently uses transparent safety rules and category signals as a working prototype. The service stores the classifier model name explicitly so a trained DistilBERT/TinyBERT campus classifier can replace that adapter when real labelled campus data is available. No demo complaints, students, incidents, or fake statistics are created by the backend.
