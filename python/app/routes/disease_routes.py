from fastapi import APIRouter, HTTPException, UploadFile, File, Header

from app.schemas.disease_schema import DiseaseResponse
from app.services.disease_service import predict_and_store as disease_predict

router = APIRouter(prefix="", tags=["disease"])


@router.post("/disease-prediction", response_model=DiseaseResponse)
async def predict_disease(image: UploadFile = File(...), user_id: str | None = Header(default=None)):
    try:
        if not image.filename.lower().endswith(("png", "jpg", "jpeg")):
            raise HTTPException(status_code=400, detail="Invalid file type")
        image_bytes = await image.read()
        result = await disease_predict(image_bytes, user_id=user_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
