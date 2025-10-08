from __future__ import annotations

from pathlib import Path
from functools import lru_cache
import io
import json
import joblib
import numpy as np
import pandas as pd
from PIL import Image
import cv2
import torch
import torch.nn as nn
from torchvision import models, transforms
import tensorflow as tf
import google.generativeai as genai

from app.core.config import get_settings


ROOT_DIR = Path(__file__).resolve().parents[2]  # points to python/
MODELS_DIR = ROOT_DIR / "models"
DATA_DIR = ROOT_DIR / "data"


@lru_cache
def get_settings_cached():
    return get_settings()


# ---------------------- Gemini / Chatbot ----------------------
@lru_cache
def get_gemini_model():
    settings = get_settings_cached()
    if settings.API_KEY:
        genai.configure(api_key=settings.API_KEY)
        return genai.GenerativeModel("gemini-2.0-flash")
    return None


# ---------------------- Classic ML models ----------------------
@lru_cache
def get_water_model():
    return joblib.load(MODELS_DIR / "water_model.pkl")


@lru_cache
def get_harvest_model():
    return joblib.load(MODELS_DIR / "harvest_model.pkl")


@lru_cache
def get_crop_encoder():
    return joblib.load(MODELS_DIR / "le_crop.pkl")


@lru_cache
def get_season_encoder():
    return joblib.load(MODELS_DIR / "le_season.pkl")


# ---------------------- Torch / Pest model ----------------------
@lru_cache
def get_pest_model_and_assets():
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 132)
    state = torch.load(MODELS_DIR / "pest_cnn_model.pth", map_location=torch.device("cpu"))
    model.load_state_dict(state)
    model.eval()

    with open(DATA_DIR / "pest_classes.txt", "r", encoding="utf-8") as f:
        pest_classes = [line.strip() for line in f.readlines()]

    pesticide_df = pd.read_csv(DATA_DIR / "Pesticides.csv")
    pest_map = {
        str(row["Pest Name"]).lower().strip(): row["Most Commonly Used Pesticides"]
        for _, row in pesticide_df.iterrows()
    }

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    return model, pest_classes, pest_map, transform


def pest_predict_from_bytes(image_bytes: bytes) -> tuple[str, str]:
    model, classes, pest_map, transform = get_pest_model_and_assets()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_tensor = transform(img).unsqueeze(0)
    with torch.no_grad():
        outputs = model(img_tensor)
        _, predicted = torch.max(outputs.data, 1)
        pest = classes[predicted.item()]
        pesticide = pest_map.get(pest.lower().strip(), "No Recommendation")
    return pest, pesticide


# ---------------------- TensorFlow / Disease model ----------------------
@lru_cache
def get_disease_model_and_labels():
    model = tf.keras.models.load_model(MODELS_DIR / "plant_disease_model.h5")
    CLASS_NAMES = ('Tomato-Bacterial_spot', 'Potato-Early blight', 'Corn-Common_rust')
    return model, CLASS_NAMES


def disease_predict_from_bytes(image_bytes: bytes) -> str:
    model, CLASS_NAMES = get_disease_model_and_labels()

    # Convert bytes to cv2 image like in user's snippet
    file_bytes = np.asarray(bytearray(image_bytes), dtype=np.uint8)
    opencv_image = cv2.imdecode(file_bytes, 1)

    # Resize image to 256x256 as in user's snippet
    opencv_image = cv2.resize(opencv_image, (256, 256))

    # Convert image to 4 dimensions as in user's snippet
    opencv_image = opencv_image.reshape(1, 256, 256, 3)

    # Make prediction
    Y_pred = model.predict(opencv_image)
    result_index = np.argmax(Y_pred)
    result = CLASS_NAMES[result_index]

    # Format output like user's snippet: "This is [plant_type] leaf with [disease]"
    plant_type = result.split('-')[0]
    disease = result.split('-')[1]
    return f"This is {plant_type} leaf with {disease}"


# ---------------------- Rules / Chatbot helpers ----------------------
@lru_cache
def get_rules_data() -> dict:
    with open(DATA_DIR / "rules.json", "r", encoding="utf-8") as f:
        return json.load(f)


def gemini_explain_disease(disease: str) -> str:
    model = get_gemini_model()
    if not model:
        return "Gemini API key not configured."
    query = f"Explain about disease {disease} and give the precaution in 5 lines clearly in simple way"
    resp = model.generate_content(query)
    return getattr(resp, "text", "No response")
