import json
import os
from collections import Counter
from typing import Dict, Any

# Analytics and logging functions
LOG_DIR = os.getenv("LOG_PATH", "./logs")

def _append_log(filename: str, data: dict):
    os.makedirs(LOG_DIR, exist_ok=True)
    filepath = os.path.join(LOG_DIR, filename)
    
    logs = []
    if os.path.exists(filepath):
        try:
            with open(filepath, "r") as f:
                logs = json.load(f)
        except json.JSONDecodeError:
            pass
            
    logs.append(data)
    with open(filepath, "w") as f:
        json.dump(logs, f, indent=2)

def _read_logs(filename: str):
    filepath = os.path.join(LOG_DIR, filename)
    if os.path.exists(filepath):
        try:
            with open(filepath, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return []
    return []

def log_query(session_id: str, query: str, intent: str, response_time: float, cx_score: int):
    _append_log("query_log.json", {
        "session_id": session_id,
        "query": query,
        "intent": intent,
        "response_time": response_time,
        "cx_score": cx_score
    })

def log_feedback(session_id: str, message_id: str, rating: str):
    _append_log("feedback_log.json", {
        "session_id": session_id,
        "message_id": message_id,
        "rating": rating
    })
    
def log_security(flag_type: str, detail: str, timestamp: str):
    _append_log("security_log.json", {
        "flag_type": flag_type,
        "detail": detail,
        "timestamp": timestamp
    })

def log_content_gap(topic: str, query: str):
    _append_log("content_gaps.json", {
        "topic": topic,
        "query": query
    })

def get_dashboard_stats(active_sessions: int):
    queries = _read_logs("query_log.json")
    feedback = _read_logs("feedback_log.json")
    
    total_queries = len(queries)
    resolution_rate = 0
    if total_queries > 0:
        resolution_rate = int(sum(1 for q in queries if q.get("intent") != "COMPLAINT") / total_queries * 100)
        
    avg_response_time = round(sum(q.get("response_time", 1.0) for q in queries) / total_queries, 2) if total_queries > 0 else 0
    
    intents = [q.get("intent", "GENERAL") for q in queries]
    top_intents = [k for k, v in Counter(intents).most_common(3)]
    
    cx_scores = [q.get("cx_score", 100) for q in queries]
    avg_cx_score = int(sum(cx_scores) / total_queries) if total_queries > 0 else 100
    
    feedback_score = 0
    if feedback:
        positive = sum(1 for f in feedback if f.get("rating") == "up")
        feedback_score = int((positive / len(feedback)) * 100)
    else:
        feedback_score = 100
        
    # Sentiment distribution
    sentiment_dist = {"positive": 0, "neutral": 0, "frustrated": 0, "angry": 0}
    for score in cx_scores:
        if score >= 80: sentiment_dist["positive"] += 1
        elif score >= 50: sentiment_dist["neutral"] += 1
        elif score >= 30: sentiment_dist["frustrated"] += 1
        else: sentiment_dist["angry"] += 1
        
    escalations = sum(1 for q in queries if q.get("cx_score", 100) < 30)

    # Convert dist to recharts format
    sentiment_data = [
        {"name": "Positive", "value": sentiment_dist["positive"]},
        {"name": "Neutral", "value": sentiment_dist["neutral"]},
        {"name": "Frustrated", "value": sentiment_dist["frustrated"]},
        {"name": "Angry", "value": sentiment_dist["angry"]}
    ]
    
    # Intent data for Recharts PieChart
    intent_counts = Counter(intents)
    intent_data = [{"name": k, "value": v} for k, v in intent_counts.items()]

    content_gaps = _read_logs("content_gaps.json")

    return {
        "total_queries": total_queries,
        "resolution_rate": resolution_rate,
        "avg_response_time": avg_response_time,
        "top_intents": top_intents,
        "top_intents_data": intent_data,
        "sentiment_distribution": sentiment_data,
        "active_sessions": active_sessions,
        "content_gaps": content_gaps[-5:], # latest 5
        "feedback_score": feedback_score,
        "avg_cx_score": avg_cx_score,
        "escalations": escalations
    }

def predict_intent(session_id: str):
    # After 5 queries in session: predict next intent by frequency
    queries = [q for q in _read_logs("query_log.json") if q.get("session_id") == session_id]
    if len(queries) >= 5:
        intents = [q.get("intent") for q in queries]
        return Counter(intents).most_common(1)[0][0]
    return "UNKNOWN"
