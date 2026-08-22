# This test does not require Gemini credentials because it checks only route registration.
from fastapi.testclient import TestClient
from app.main import app

def test_root_route_exists():
    with TestClient(app) as client:
        response = client.get("/")
    assert response.status_code == 200
    assert response.json()["service"] == "EpCraft RAG Chatbot API"
