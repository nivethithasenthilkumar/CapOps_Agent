import time
from nlu import classify_intent
from rag import query_kb
from actions import create_ticket, reset_password, submit_leave, request_access, classify_email, fill_form
from sentiment import analyze_sentiment
from session import get_session
from security import check_security
from analytics import log_query, log_content_gap
from typing import Dict, Any

def run_agent(session_id: str, new_message: str, image_data: dict = None) -> dict:
    session = get_session(session_id)
    reasoning_steps = []
    
    def add_step(label: str, detail: str, status: str = "green"):
        reasoning_steps.append({
            "timestamp": time.time(),
            "label": label,
            "detail": detail,
            "status": status
        })

    add_step("Perceive", f"Received message length: {len(new_message)}", "green")
    if image_data:
        add_step("Perceive", f"Received image of type: {image_data.get('type')}", "green")
        
    t0 = time.time()
    nlu_res = classify_intent(new_message)
    intent = nlu_res.get("intent", "GENERAL")
    add_step("NLU", f"Detected intent: {intent}", "green")
    
    flags = check_security(session_id, new_message, intent, time.time())
    if flags:
        add_step("Security", f"Flags triggered: {flags}", "amber")
        
    sent_res = analyze_sentiment(new_message)
    cx_score = sent_res.get("score", 100)
    session["cx_score"] = cx_score
    add_step("Sentiment", f"Score: {cx_score}, Sentiment: {sent_res.get('sentiment')}", "green")
    
    escalated = False
    action_chip = None
    source_chip = None
    response_text = ""
    
    session["sentiment_history"].append(sent_res.get("sentiment"))
    recent_sentiments = session["sentiment_history"][-2:]
    
    if recent_sentiments == ["angry", "angry"] or cx_score < 30:
        escalated = True
        add_step("Plan", "Consecutive angry sentiments or low score detected. Escalating.", "red")
        response_text = "I apologize that I couldn't resolve your issue. I am connecting you with a human agent immediately."
        ticket = create_ticket("Escalated from AI Agent", "P1", "CX_ESCALATION")
        action_chip = f"Ticket {ticket['ticket_id']}"
    else:
        if intent == "HR_LEAVE_QUERY":
            add_step("Plan", "Querying Knowledge Base for HR Leave Policies", "green")
            rag_res = query_kb(new_message)
            add_step("RAG", f"Source: {rag_res['source_doc']}, Confidence: {rag_res['confidence_score']}", "green")
            source_chip = rag_res['source_doc']
            response_text = rag_res['answer']
            if nlu_res.get('employee_id') and nlu_res.get('date_range'):
                act_res = submit_leave(nlu_res['employee_id'], "Annual", "2023-10-01", "2023-10-05")
                action_chip = f"Leave Request {act_res['ref_id']}"
                response_text += f"\n\nI have also initiated a leave request for you: {action_chip}."
                
        elif intent == "IT_ACCESS_REQUEST":
            add_step("Plan", "Routing Access Request", "green")
            sys = nlu_res.get('system_name') or "Requested System"
            emp = nlu_res.get('employee_id') or "Unknown"
            act_res = request_access(emp, sys, new_message)
            action_chip = f"Req {act_res['ref_id']}"
            response_text = f"I have submitted your access request for {sys}. Reference: {act_res['ref_id']}."
            
        elif intent == "PASSWORD_RESET":
            add_step("Plan", "Initiating Password Reset", "green")
            sys = nlu_res.get('system_name') or "System"
            emp = nlu_res.get('employee_id') or "Unknown"
            act_res = reset_password(emp, sys)
            action_chip = f"Reset {act_res['ref_id']}"
            response_text = f"Password reset instructions for {sys} have been sent to your email. Ref: {act_res['ref_id']}."

        elif intent == "INVOICE_STATUS":
            add_step("Plan", "Querying Finance FAQ", "green")
            rag_res = query_kb(new_message)
            source_chip = rag_res['source_doc']
            response_text = rag_res['answer']
            if image_data and image_data.get("type") == "INVOICE":
                response_text += f"\n\nI also see you attached an invoice. Extracted details: {image_data.get('extracted_data')}"
            
        elif intent == "ONBOARDING_HELP":
            add_step("Plan", "Querying Onboarding Docs", "green")
            rag_res = query_kb(new_message)
            source_chip = rag_res['source_doc']
            response_text = rag_res['answer']
            
        else:
            add_step("Plan", "General query, consulting KB", "green")
            rag_res = query_kb(new_message)
            source_chip = rag_res['source_doc']
            if rag_res['confidence_score'] < 0.90:
                add_step("Reflect", "Low confidence score. Asking for clarification.", "amber")
                response_text = "I'm not completely sure I understand. Could you please clarify your request?"
                log_content_gap(intent, new_message)
            else:
                response_text = rag_res['answer']

    response_time = time.time() - t0
    add_step("Reflect", f"Response generated in {response_time:.2f}s", "green")
    
    session["messages"].append({"role": "user", "content": new_message})
    session["messages"].append({"role": "bot", "content": response_text})
    session["reasoning_traces"].append(reasoning_steps)
    
    log_query(session_id, new_message, intent, response_time, cx_score)
    
    return {
        "text": response_text,
        "intent": intent,
        "sentiment": sent_res.get("sentiment"),
        "source_doc": source_chip,
        "action_chip": action_chip,
        "reasoning_steps": reasoning_steps,
        "escalated": escalated,
        "escalation_priority": sent_res.get("priority") if escalated else None,
        "recommended_action": sent_res.get("recommended_action")
    }
