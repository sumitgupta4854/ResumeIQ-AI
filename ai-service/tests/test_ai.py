from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
SAMPLE = "John Doe\njohn@example.com\n+1 555-0100\nSUMMARY\nPython developer with 3 years building APIs.\nEXPERIENCE\n• Built REST API serving 10k users, reduced latency 30%.\nEDUCATION\nB.Tech Computer Science.\nSKILLS\nPython, React, SQL, Docker, AWS, communication"

def test_health():
    assert client.get("/health").json()["status"] == "ok"

def test_analyze_ok():
    r = client.post("/analyze-resume", json={"text": SAMPLE * 3})
    assert r.status_code == 200
    assert 0 <= r.json()["overall_score"] <= 100

def test_analyze_invalid():
    r = client.post("/analyze-resume", json={"text": "short"})
    assert r.status_code == 422

def test_match():
    r = client.post("/match-job", json={"resume_text": SAMPLE * 3, "job_description": "We need Python, React, SQL and AWS developer with APIs " * 5})
    assert r.status_code == 200
    assert "match_score" in r.json()

def test_improve():
    r = client.post("/improve-resume", json={"task": "bullet", "original": "worked on api stuff"})
    assert r.status_code == 200
