from __future__ import annotations

from pathlib import Path
from functools import lru_cache
import io
import json
import joblib
import numpy as np
import pandas as pd
from PIL import Image
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
    model = tf.keras.models.load_model(MODELS_DIR / "CNN_model.h5")
    labels = {
        0: "Apple Apple_scab", 1: "Apple Black rot", 2: "Apple Cedar_apple_rust", 3: "Apple healthy",
        4: "Blueberry healthy", 5: "Cherry (including sour) Powdery mildew", 6: "Cherry (including sour) healthy",
        7: "Corn (maize) Cercospora leaf spot Gray leaf spot", 8: "Corn (maize) Common rust", 9: "Corn (maize) Northern Leaf Blight",
        10: "Corn (maize) healthy", 11: "Grape Black rot", 12: "Grape Leaf blight (Isariopsis Leaf Spot)", 13: "Grape healthy",
        14: "Orange Haunglongbing (Citrus greening)", 15: "Peach Bacterial spot", 16: "Peach healthy",
        17: "Pepper (bell) Bacterial spot", 18: "Pepper (bell) healthy", 19: "Potato Early blight",
        20: "Potato Late blight", 21: "Potato healthy", 22: "Raspberry healthy", 23: "Soybean healthy",
        24: "Squash Powdery mildew", 25: "Strawberry Leaf scorch", 26: "Strawberry healthy",
        27: "Tomato Bacterial spot", 28: "Tomato Late blight", 29: "Tomato Leaf Mold",
        30: "Tomato Septoria leaf spot", 31: "Tomato Spider mites (Two-spotted spider mite)",
        32: "Tomato Target Spot", 33: "Tomato Yellow Leaf Curl Virus", 34: "Tomato Mosaic Virus",
        35: "Tomato healthy"
    }
    return model, labels


def disease_predict_from_bytes(image_bytes: bytes) -> str:
    model, labels = get_disease_model_and_labels()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((128, 128))
    arr = (np.array(img) / 255.0).astype("float32")
    arr = np.expand_dims(arr, axis=0)
    pred = model.predict(arr)
    pred_class = int(np.argmax(pred))
    return labels.get(pred_class, "Unknown Disease")


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
