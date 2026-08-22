# EpCraft Chatbot API

Production-oriented FastAPI RAG service for the EpCraft storefront. It reads public product information from Supabase, retrieves relevant context with Chroma, and generates support answers with Gemini.

## Endpoints

- `GET /` — service identity
- `GET /health` — Render health check; returns 503 if RAG startup failed
- `GET /docs` — interactive OpenAPI test page
- `POST /chat` — customer chatbot request

## Local run

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env # Windows PowerShell: Copy-Item .env.example .env
# Fill real values in .env
uvicorn app.main:app --reload --port 8000
```

Visit `http://127.0.0.1:8000/docs`.

## Request example

```json
{"question":"Do you offer free shipping?","chat_history":""}
```

## Security

Never commit `.env`, Gemini keys, Supabase service-role keys, or production secrets. Set secrets in Render's Environment page. `ALLOWED_ORIGINS` must include the deployed frontend address, e.g. `https://ep-craft.vercel.app`.

## Render

Deploy this directory as a Render Web Service with **Root Directory** set to `epcraft-chatbot-api`. Use build command `pip install -r requirements.txt` and start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
