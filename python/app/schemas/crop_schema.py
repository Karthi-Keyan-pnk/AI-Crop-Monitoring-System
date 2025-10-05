from pydantic import BaseModel


class CropRequest(BaseModel):
    crop: str
    season: str
    temperature: float
    humidity: float
    ph: float
    avg_water: float


class CropResponse(BaseModel):
    water_required: float
    days_until_harvest: float
