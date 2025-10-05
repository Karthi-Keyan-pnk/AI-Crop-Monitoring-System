from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class CropDocument(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    prediction: Dict[str, Any]
    input: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.now)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
