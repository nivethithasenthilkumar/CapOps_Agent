import os
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field

class SentimentResult(BaseModel):
    sentiment: str = Field(description="Must be one of: positive, neutral, frustrated, angry")
    score: int = Field(description="CX score between 0 and 100")
    recommended_action: str = Field(description="Recommended next action")
    priority: str = Field(description="P1, P2, or P3 based on sentiment")

def analyze_sentiment(text: str) -> dict:
    model_name = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")
    try:
        llm = ChatAnthropic(model=model_name, temperature=0)
        prompt = PromptTemplate.from_template(
            "Analyze the sentiment of the following text: '{text}'. "
            "Classify into positive, neutral, frustrated, or angry. "
            "Also assign a CX score (0-100) and priority (P1, P2, P3)."
        )
        chain = prompt | llm.with_structured_output(SentimentResult)
        res = chain.invoke({"text": text})
        return res.dict()
    except Exception as e:
        print(f"Sentiment Error: {e}")
        return {"sentiment": "neutral", "score": 50, "recommended_action": "Continue conversation", "priority": "P3"}
