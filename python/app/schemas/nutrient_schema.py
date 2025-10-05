from pydantic import BaseModel, EmailStr
from typing import List, Dict, Optional


class NutrientRequest(BaseModel):
    mobile_number: str
    email: EmailStr


class NutrientResponse(BaseModel):
    medium_red_region_count: int
    regions: List[Dict[str, int]]
    whatsapp_messages: List[str]
    whatsapp_url: Optional[str]
    email_sent_to: Optional[EmailStr]
