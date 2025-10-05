from datetime import datetime
from typing import Dict, Any, Optional

from app.core.database import get_db
from app.utils.ai_helpers import pest_predict_from_bytes


async def predict_and_store(image_bytes: bytes, user_id: Optional[str] = None) -> Dict[str, Any]:
    pest, pesticide = pest_predict_from_bytes(image_bytes)

    result = {"pest": pest, "pesticide": pesticide}

    db = get_db()
    await db["pests"].insert_one({
        "prediction": result,
        "input": {"file": "image"},
        "user_id": user_id,
        "timestamp": datetime.now(),
    })

    return result
