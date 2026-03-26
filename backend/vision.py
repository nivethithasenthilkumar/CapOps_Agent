import os
import json
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage

def analyze_image(base64_img: str) -> dict:
    model_name = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")
    try:
        llm = ChatAnthropic(model=model_name, temperature=0)
        msg = HumanMessage(
            content=[
                {"type": "text", "text": "Analyze this image. Detect type (ERROR_SCREENSHOT, INVOICE, FORM, OTHER). If ERROR_SCREENSHOT, describe error and suggest fix. If INVOICE, extract invoice_number, amount, vendor, date. If FORM, extract fields. Return a JSON object with a 'type' key and an 'extracted_data' key containing the parsed info. Output exactly valid JSON and nothing else."},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{base64_img}"}
                }
            ]
        )
        response = llm.invoke([msg])
        content = str(response.content)
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        return json.loads(content.strip())
    except Exception as e:
        print(f"Vision error: {e}")
        return {"type": "OTHER", "extracted_data": {}, "error": str(e)}
