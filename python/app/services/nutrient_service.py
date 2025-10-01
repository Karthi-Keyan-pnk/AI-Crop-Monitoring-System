from datetime import datetime
from typing import Dict, Any, List

import io
import numpy as np
from PIL import Image
from scipy import ndimage

from app.core.database import get_db
from app.utils.email_utils import send_email
from app.utils.whatsapp_utils import build_whatsapp_link


async def predict_and_store(image_bytes: bytes, mobile_number: str, email: str, user_id: str | None = None) -> Dict[str, Any]:
    # Load image and convert to grayscale
    input_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_array = np.array(input_image)

    if len(img_array.shape) == 3:
        img_gray = img_array.mean(axis=2)
    else:
        img_gray = img_array

    # Normalize to 0-1
    img_norm = (img_gray - img_gray.min()) / (img_gray.max() - img_gray.min() + 1e-8)

    # Medium-intensity range to indicate possible deficiency
    medium_red_min = 0.75
    medium_red_max = 0.9
    mask = (img_norm >= medium_red_min) & (img_norm <= medium_red_max)

    # Label connected regions
    labeled, _ = ndimage.label(mask)
    slices = ndimage.find_objects(labeled) or []

    regions: List[Dict[str, int]] = []
    messages: List[str] = []
    for idx, sl in enumerate(slices, 1):
        y, x = sl
        box = {
            "x_start": int(x.start),
            "x_stop": int(x.stop),
            "y_start": int(y.start),
            "y_stop": int(y.stop),
        }
        regions.append(box)
        msg = (
            f"Region {idx}: Possible nutrient deficiency detected in area "
            f"({box['x_start']},{box['y_start']}) to ({box['x_stop']},{box['y_stop']}). "
            "Please inspect this region and consider soil testing or targeted fertilization."
        )
        messages.append(msg)

    message_text = "\n".join(messages) if messages else "No significant deficiency regions detected."
    whatsapp_url = build_whatsapp_link(mobile_number, message_text) if messages else None

    email_error = None
    if email:
        email_error = send_email(
            subject="Crop Nutrient Deficiency Alert",
            body=message_text,
            to_email=email,
        )

    result = {
        "medium_red_region_count": len(regions),
        "regions": regions,
        "whatsapp_messages": messages,
        "whatsapp_url": whatsapp_url,
        "email_sent_to": None if email_error else email,
    }

    db = get_db()
    await db["nutrients"].insert_one({
        "prediction": result,
        "input": {"mobile_number": mobile_number, "email": email},
        "user_id": user_id,
        "timestamp": datetime.now(),
    })

    return result
