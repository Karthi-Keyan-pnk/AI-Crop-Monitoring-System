from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Header

from app.schemas.nutrient_schema import NutrientRequest, NutrientResponse
from app.services.nutrient_service import predict_and_store as nutrient_predict

router = APIRouter(prefix="", tags=["nutrient"])


@router.post("/predict_nutrient_deficiency", response_model=NutrientResponse)
async def predict_nutrient_deficiency(
    image: UploadFile = File(...),
    mobile_number: str = Form(...),
    email: str = Form(...),
    user_id: str | None = Header(default=None),
):
    try:
        image_bytes = await image.read()
        result = await nutrient_predict(image_bytes, mobile_number, email, user_id=user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
