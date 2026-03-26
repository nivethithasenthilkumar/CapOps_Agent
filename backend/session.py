import uuid

# In-memory session store keyed by UUID.
sessions = {}

def create_session(channel="CHAT", language="en"):
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "messages": [],
        "sentiment_history": [],
        "reasoning_traces": [],
        "personalization_profile": {},
        "cx_score": 100,
        "security_flags": [],
        "channel": channel,
        "language": language,
        "query_times": [] # For rate limiting detection
    }
    return session_id

def get_session(session_id: str):
    if session_id not in sessions:
        sessions[session_id] = {
            "messages": [],
            "sentiment_history": [],
            "reasoning_traces": [],
            "personalization_profile": {},
            "cx_score": 100,
            "security_flags": [],
            "channel": "CHAT",
            "language": "en",
            "query_times": []
        }
    return sessions[session_id]

def delete_session(session_id: str):
    if session_id in sessions:
        del sessions[session_id]
        return True
    return False

def get_active_sessions_count():
    return len(sessions)
