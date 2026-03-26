import os
import uvicorn
from fastapi import FastAPI, Request, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from session import create_session, get_session, delete_session, get_active_sessions_count
from agent import run_agent
from analytics import get_dashboard_stats, log_feedback, predict_intent
from vision import analyze_image

app = FastAPI(title="CapOps Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Worker-ID"]
)

WORKER_ID = os.getenv("WORKER_ID", "worker-1")

@app.middleware("http")
async def add_worker_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Worker-ID"] = WORKER_ID
    return response

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    channel: Optional[str] = "CHAT"
    language: Optional[str] = "en"

class FeedbackRequest(BaseModel):
    session_id: str
    message_id: str
    rating: str

@app.get("/health")
def health_check():
    return {"status": "ok", "worker": WORKER_ID}

@app.post("/chat")
def chat(req: ChatRequest):
    sid = req.session_id
    if not sid:
        sid = create_session(channel=req.channel, language=req.language)
    
    res = run_agent(sid, req.message)
    res["session_id"] = sid
    return res

@app.post("/chat/voice")
async def chat_voice(session_id: str = Form(...), voice_text: str = Form(...)):
    res = run_agent(session_id, voice_text)
    res["session_id"] = session_id
    return res

@app.post("/chat/image")
async def chat_image(session_id: str = Form(...), message: str = Form(...), image_base64: str = Form(...)):
    vision_data = analyze_image(image_base64)
    res = run_agent(session_id, message, image_data=vision_data)
    res["session_id"] = session_id
    return res

@app.get("/session/{id}/history")
def get_history(id: str):
    session = get_session(id)
    return {
        "messages": session.get("messages", []),
        "reasoning": session.get("reasoning_traces", []),
        "cx_score": session.get("cx_score", 100)
    }

@app.delete("/session/{id}")
def delete_session_endpoint(id: str):
    success = delete_session(id)
    if success:
        return {"status": "cleared"}
    raise HTTPException(status_code=404, detail="Session not found")

@app.get("/dashboard/stats")
def dashboard_stats():
    active = get_active_sessions_count()
    return get_dashboard_stats(active)

@app.post("/escalate")
def escalate(req: ChatRequest):
    return {"status": "escalated", "ticket_id": "P1-9999"}

@app.post("/feedback")
def submit_feedback(req: FeedbackRequest):
    log_feedback(req.session_id, req.message_id, req.rating)
    return {"status": "recorded"}

@app.get("/predict/{session_id}")
def predict(session_id: str):
    intent = predict_intent(session_id)
    return {"predicted_intent": intent}

@app.get("/gaps/content")
def gaps_content():
    stats = get_dashboard_stats(0)
    return {"content_gaps": stats.get("content_gaps", [])}
