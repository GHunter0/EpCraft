import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.rag import RAGService
from app.schemas import ChatRequest, ChatResponse, HealthResponse

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)
settings = get_settings()
rag_service = RAGService(settings)
startup_error: str | None = None

@asynccontextmanager
async def lifespan(_: FastAPI):
    global startup_error
    try:
        rag_service.initialize()
    except Exception as exc:
        startup_error = str(exc)
        logger.exception("RAG initialization failed")
    yield

app = FastAPI(title="EpCraft RAG Chatbot API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["Content-Type", "Authorization"])

@app.get("/", response_model=HealthResponse, tags=["Health"])
def root() -> HealthResponse:
    return HealthResponse(status="online", service="EpCraft RAG Chatbot API")

@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health() -> HealthResponse:
    if startup_error:
        raise HTTPException(status_code=503, detail="Chatbot initialization failed. Check server logs and environment variables.")
    return HealthResponse(status="healthy", service="EpCraft RAG Chatbot API")

@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
def chat(payload: ChatRequest, request: Request) -> ChatResponse:
    if startup_error:
        raise HTTPException(status_code=503, detail="Chatbot is not ready. Please try again shortly.")
    try:
        return ChatResponse(answer=rag_service.answer(payload.question, payload.chat_history))
    except Exception:
        logger.exception("Chat request failed; request_id=%s", request.headers.get("x-request-id", "not-provided"))
        raise HTTPException(status_code=500, detail="Unable to process the chatbot request.")
