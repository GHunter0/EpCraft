from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    chat_history: str = Field(default="", max_length=12000)

class ChatResponse(BaseModel):
    answer: str

class HealthResponse(BaseModel):
    status: str
    service: str
