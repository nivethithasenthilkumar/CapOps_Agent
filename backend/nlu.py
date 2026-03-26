import os
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
from typing import Optional

class NLUResult(BaseModel):
    intent: str = Field(description="Must be one of: IT_ACCESS_REQUEST, HR_LEAVE_QUERY, INVOICE_STATUS, PASSWORD_RESET, ONBOARDING_HELP, COMPLAINT, GENERAL")
    employee_id: Optional[str] = Field(None, description="Employee ID like CG-1234 extracted from text")
    department: Optional[str] = Field(None)
    date_range: Optional[str] = Field(None)
    ticket_id: Optional[str] = Field(None)
    system_name: Optional[str] = Field(None)
    priority: Optional[str] = Field(None)
    language: str = Field(description="Detected language code, e.g., en, hi, ta, fr. Auto-detect from text.")

def classify_intent(text: str) -> dict:
    model_name = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")
    try:
        llm = ChatAnthropic(model=model_name, temperature=0)
        prompt = PromptTemplate.from_template(
            "Analyze the following user query according to the provided instructions.\nQuery: {query}\n"
            "Extract intent, entities and language into a JSON object."
        )
        chain = prompt | llm.with_structured_output(NLUResult)
        res = chain.invoke({"query": text})
        return res.dict()
    except Exception as e:
        print(f"NLU Error: {e}")
        return {
            "intent": "GENERAL",
            "language": "en",
            "employee_id": None, "department": None, "date_range": None,
            "ticket_id": None, "system_name": None, "priority": None
        }
