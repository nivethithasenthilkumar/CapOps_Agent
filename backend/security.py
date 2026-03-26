import json
import os
import re
from typing import List
from session import get_session
from analytics import log_security

def load_employees():
    path = os.path.join(os.path.dirname(__file__), "mock_data", "employees.json")
    try:
        with open(path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

EMPLOYEES = load_employees()
EMPLOYEE_IDS = {emp["emp_id"] for emp in EMPLOYEES}

def mask_pii(text: str) -> str:
    if not text:
        return text
    # Mask emails
    text = re.sub(r'[\w\.-]+@[\w\.-]+', r'****@cap.com', text)
    # Mask employee IDs
    text = re.sub(r'CG-\d{4}', r'CG-4***', text)
    # Mask phone numbers (simple pattern)
    text = re.sub(r'\b\d{10}\b', r'**********', text)
    return text

def check_security(session_id: str, new_message: str, intent: str, timestamp: float) -> List[str]:
    session = get_session(session_id)
    flags = []
    
    # 1. Rate Limit: >20 messages in 2 min
    query_times = session.setdefault("query_times", [])
    query_times.append(timestamp)
    # Keep only last 2 minutes
    query_times = [t for t in query_times if timestamp - t <= 120]
    session["query_times"] = query_times
    
    if len(query_times) > 20:
        flags.append("RATE_LIMIT_FLAG")
        log_security("RATE_LIMIT_FLAG", f"Session {session_id} exceeded rate limit.", str(timestamp))
        
    # 2. Password reset 3+ times
    if intent == "PASSWORD_RESET":
        pwd_resets = session.setdefault("pwd_reset_count", 0) + 1
        session["pwd_reset_count"] = pwd_resets
        if pwd_resets >= 3:
            flags.append("SECURITY_FLAG")
            log_security("SECURITY_FLAG", f"Session {session_id} requested password reset 3+ times.", str(timestamp))
            
    # 3. Employee ID validity
    emp_ids_in_text = re.findall(r'CG-\d{4}', new_message.upper())
    for eid in emp_ids_in_text:
        if eid not in EMPLOYEE_IDS:
            flags.append("INVALID_EMP_FLAG")
            log_security("INVALID_EMP_FLAG", f"Session {session_id} used invalid emp ID: {eid}", str(timestamp))
            
    # 4. PII patterns
    if re.search(r'[\w\.-]+@[\w\.-]+', new_message) or re.search(r'\b\d{10}\b', new_message) or "@capgemini.com" in new_message.lower():
        flags.append("PII_FLAG")
        log_security("PII_FLAG", f"Session {session_id} contained PII.", str(timestamp))

    if flags:
        session["security_flags"].extend(flags)
        
    return flags
