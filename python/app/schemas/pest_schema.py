from pydantic import BaseModel


class PestResponse(BaseModel):
    pest: str
    pesticide: str
