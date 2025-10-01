from urllib.parse import quote
from typing import Optional


def build_whatsapp_link(mobile_number: str, message_text: str) -> Optional[str]:
    if not (mobile_number and message_text):
        return None
    return f"https://wa.me/{mobile_number}?text={quote(message_text)}"
