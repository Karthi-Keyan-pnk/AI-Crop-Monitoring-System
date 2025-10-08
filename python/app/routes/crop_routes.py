from fastapi import APIRouter, HTTPException, Header

from app.schemas.crop_schema import CropRequest, CropResponse
from app.services.crop_service import predict_and_store as crop_predict
from app.utils.ai_helpers import get_crop_encoder, get_season_encoder

router = APIRouter(prefix="", tags=["crop"])


@router.post("/predict_crop", response_model=CropResponse)
async def predict_crop(request: CropRequest, user_id: str | None = Header(default=None)):
    try:
        result = await crop_predict(request, user_id=user_id)
        return result
    except ValueError as ve:
        crops = list(get_crop_encoder().classes_)
        seasons = list(get_season_encoder().classes_)
        raise HTTPException(status_code=400, detail={
            "error": str(ve),
            "valid_crops": crops,
            "valid_seasons": seasons,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
