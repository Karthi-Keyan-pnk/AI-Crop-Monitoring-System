from fastapi import APIRouter, HTTPException, UploadFile, File, Header

from app.schemas.pest_schema import PestResponse
from app.services.pest_service import predict_and_store as pest_predict

router = APIRouter(prefix="", tags=["pest"])


@router.post("/predict_pest", response_model=PestResponse)
async def predict_pest(image: UploadFile = File(...), x_user_id: str | None = Header(default=None)):
    try:
        image_bytes = await image.read()
        result = await pest_predict(image_bytes, user_id=x_user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
