import time
import uuid

# 6 mock API functions

def create_ticket(summary: str, priority: str, category: str) -> dict:
    ticket_id = f"INC-{uuid.uuid4().hex[:6].upper()}"
    return {
        "ref_id": ticket_id,
        "ticket_id": ticket_id,
        "timestamp": time.time(),
        "status": "CREATED",
        "detail": f"Ticket {ticket_id} created for {category} with priority {priority}."
    }

def reset_password(employee_id: str, system: str) -> dict:
    ref_id = f"RST-{uuid.uuid4().hex[:6].upper()}"
    return {
        "ref_id": ref_id,
        "timestamp": time.time(),
        "status": "SUCCESS",
        "detail": f"Password reset instructions for {system} sent to {employee_id}."
    }

def submit_leave(employee_id: str, leave_type: str, from_date: str, to_date: str) -> dict:
    ref_id = f"LV-{uuid.uuid4().hex[:6].upper()}"
    return {
        "ref_id": ref_id,
        "timestamp": time.time(),
        "status": "PENDING_APPROVAL",
        "detail": f"Leave request ({leave_type}) from {from_date} to {to_date} submitted."
    }

def request_access(employee_id: str, system: str, justification: str) -> dict:
    ref_id = f"ACC-{uuid.uuid4().hex[:6].upper()}"
    return {
        "ref_id": ref_id,
        "timestamp": time.time(),
        "status": "PENDING_MGR_APPROVAL",
        "detail": f"Access request for {system} routed to manager."
    }

def classify_email(subject: str, body: str) -> dict:
    ref_id = f"EML-{uuid.uuid4().hex[:6].upper()}"
    # Mock classification
    category = "GENERAL"
    if "invoice" in subject.lower() or "billing" in body.lower():
        category = "FINANCE"
    elif "access" in subject.lower() or "password" in body.lower():
        category = "IT_SUPPORT"
        
    return {
        "ref_id": ref_id,
        "timestamp": time.time(),
        "status": "CLASSIFIED",
        "category": category
    }

def fill_form(form_type: str, fields_dict: dict) -> dict:
    ref_id = f"FRM-{uuid.uuid4().hex[:6].upper()}"
    return {
        "ref_id": ref_id,
        "timestamp": time.time(),
        "status": "SUBMITTED",
        "detail": f"Form {form_type} submitted successfully."
    }
