from datetime import datetime
from typing import Dict, Any, Optional

from app.core.database import get_db
from app.utils.ai_helpers import (
    get_water_model,
    get_harvest_model,
    get_crop_encoder,
    get_season_encoder,
)
from app.schemas.crop_schema import CropRequest


async def predict_and_store(request: CropRequest, user_id: Optional[str] = None) -> Dict[str, Any]:
    crop_encoder = get_crop_encoder()
    season_encoder = get_season_encoder()
    water_model = get_water_model()
    harvest_model = get_harvest_model()


    def normalize_label(label: str, known: list[str]) -> str:
        mapping = {k.lower(): k for k in known}
        key = label.strip().lower()
        if key not in mapping:
            raise ValueError(f"Unknown label: {label}")
        return mapping[key]

    crop_label = normalize_label(request.crop, list(crop_encoder.classes_))
    season_label = normalize_label(request.season, list(season_encoder.classes_))

    crop_encoded = crop_encoder.transform([crop_label])[0]
    season_encoded = season_encoder.transform([season_label])[0]

    water_features = [[
        crop_encoded,
        season_encoded,
        request.temperature,
        request.humidity,
        request.ph,
        request.avg_water,
    ]]
    water_pred = float(water_model.predict(water_features)[0])

    harvest_features = [[
        crop_encoded,
        season_encoded,
        request.temperature,
        request.humidity,
        request.ph,
        water_pred,
    ]]
    harvest_pred = float(harvest_model.predict(harvest_features)[0])

    result = {
        "water_required": round(water_pred, 2),
        "days_until_harvest": round(harvest_pred, 0),
    }

    db = get_db()
    try:
        await db["crops"].insert_one({
            "prediction": result,
            "input": request.model_dump(),
            "user_id": user_id,
            "timestamp": datetime.now(),
        })
    except Exception:
        pass

    return result
