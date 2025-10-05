from fastapi import APIRouter, HTTPException, Request

from app.utils.ai_helpers import get_rules_data, get_gemini_model

router = APIRouter(prefix="", tags=["chatbot"])


@router.post("/chatbot")
async def chatbot_endpoint(req: Request):
    try:
        body = await req.json()
        user_message: str = body.get("message", "").strip()
        if not user_message:
            return {"reply": "Please provide a message."}

        rules = get_rules_data()
        model = get_gemini_model()
        if model is None:
            return {"reply": "Gemini API key not configured."}

        prompt = (
            "You are Agro, an AI assistant for the AI Crop Monitoring System.\n"
            "Follow these rules:\n" + "\n".join(rules.get("rules", [])) + "\n\n"
            "Respond in a friendly, human-like, conversational tone.\n"
            "Use bullet points or numbered lists if listing features or steps.\n"
            "Keep answers concise, 2-5 sentences max.\n"
            "Do not repeat your name in every message.\n"
            "If user asks for something outside your scope, politely tell them.\n\n"
            f"User: {user_message}\nAgro:"
        )

        response = model.generate_content(prompt)
        return {"reply": response.text.strip() if hasattr(response, "text") else ""}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
