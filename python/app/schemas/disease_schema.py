from pydantic import BaseModel
from typing import Optional


class DiseaseResponse(BaseModel):
    disease: str
    explanation: Optional[str]
