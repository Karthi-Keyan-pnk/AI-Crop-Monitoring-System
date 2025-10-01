from datetime import datetime
from typing import Dict, Any, Optional

from app.core.database import get_db
from app.utils.ai_helpers import disease_predict_from_bytes, gemini_explain_disease


async def predict_and_store(image: bytes, x_user_id: Optional[str] = None) -> Dict[str, Any]:
    disease = disease_predict_from_bytes(image)
    explanation = gemini_explain_disease(disease)

    result = {"disease": disease, "explanation": explanation}

    db = get_db()
    await db["diseases"].insert_one({
        "prediction": result,
        "input": {"file": "image"},
        "user_id": x_user_id,
        "timestamp": datetime.now(),
    })

    return result
