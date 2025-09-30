from fastapi import FastAPI, UploadFile, File, HTTPException, Form , Request
import smtplib
from email.mime.text import MIMEText
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import joblib
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import pandas as pd
import os
import uvicorn
import tensorflow as tf
import io
import google.generativeai as genai
from dotenv import load_dotenv
import numpy as np
from scipy import ndimage
from scipy import ndimage
from datetime import datetime
import tempfile
import os
import cv2
from fastapi.responses import FileResponse
import json

# ========== INIT APP ==========
app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== PATH SETUP ==========
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
MODEL_DIR = os.path.join(BASE_DIR, ".", "models")
DATA_DIR = os.path.join(BASE_DIR, ".", "data")

# ========== LOAD MODELS ==========
print("✅ Loading models...")
try:
    water_model = joblib.load(os.path.join(MODEL_DIR, "water_model.pkl"))
    harvest_model = joblib.load(os.path.join(MODEL_DIR, "harvest_model.pkl"))
    crop_encoder = joblib.load(os.path.join(MODEL_DIR, "le_crop.pkl"))
    season_encoder = joblib.load(os.path.join(MODEL_DIR, "le_season.pkl"))

    # Load CNN pest detection model
    pest_model = models.resnet18(weights=None)
    pest_model.fc = nn.Linear(pest_model.fc.in_features, 132)
    pest_model.load_state_dict(torch.load(
        os.path.join(MODEL_DIR, "pest_cnn_model.pth"),
        map_location=torch.device("cpu")
    ))
    pest_model.eval()

    # Load pest class names
    with open(os.path.join(DATA_DIR, "pest_classes.txt"), "r") as f:
        pest_classes = [line.strip() for line in f.readlines()]

    # Load pesticide mapping
    pesticide_df = pd.read_csv(os.path.join(DATA_DIR, "Pesticides.csv"))
    pest_map = {
        row['Pest Name'].lower().strip(): row['Most Commonly Used Pesticides']
        for _, row in pesticide_df.iterrows()
    }

    # Load TensorFlow disease prediction model
    disease_model_path = os.path.join(MODEL_DIR, "CNN_model.h5")
    model_disease = tf.keras.models.load_model(disease_model_path)

    # Disease class labels
    global disease_class_labels
    disease_class_labels = {
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

    with open(os.path.join(DATA_DIR, "rules.json"), "r") as f:
        RULES_DATA = json.load(f)

    CHATBOT_INSTRUCTIONS = f"You are the official chatbot for {RULES_DATA['site_name']}.\n"
    for rule in RULES_DATA["rules"]:
        CHATBOT_INSTRUCTIONS += f"- {rule}\n"


    # Initialize Gemini AI model for disease explanation
    load_dotenv()
    API_KEY = os.getenv("API_KEY")
    genai.configure(api_key=API_KEY)
    aimodel = genai.GenerativeModel('gemini-2.0-flash')
    chat = aimodel.start_chat()

    print("✅ All models loaded successfully!")
except Exception as e:
    print("❌ Error loading models:", str(e))
    raise RuntimeError(f"Error loading models: {str(e)}")

# ========== REQUEST MODELS ==========
class CropRequest(BaseModel):
    crop: str
    season: str
    temperature: float
    humidity: float
    ph: float
    avg_water: float

# ========== ROUTES ==========

load_dotenv()


# ✅ Predict crop water and harvest date
@app.post("/predict_crop")
async def predict_crop(request: CropRequest):
    try:
        # Encode categorical inputs
        crop_encoded = crop_encoder.transform([request.crop])[0]
        season_encoded = season_encoder.transform([request.season])[0]

        # ---------------- WATER MODEL ----------------
        water_features = [[
            crop_encoded,
            season_encoded,
            request.temperature,
            request.humidity,
            request.ph,
            request.avg_water
        ]]
        water_pred = water_model.predict(water_features)[0]

        # ---------------- HARVEST MODEL ----------------
        harvest_features = [[
            crop_encoded,
            season_encoded,
            request.temperature,
            request.humidity,
            request.ph,
            water_pred  # Predicted water requirement is input for harvest model
        ]]
        harvest_pred = harvest_model.predict(harvest_features)[0]

        return JSONResponse(content={
            "water_required": round(float(water_pred), 2),
            "days_until_harvest": round(float(harvest_pred), 0)
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




# ✅ Predict pest and recommend pesticide
@app.post("/predict_pest")
async def predict_pest(image: UploadFile = File(...)):
    try:
        img = Image.open(image.file).convert("RGB")
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225])
        ])
        img_tensor = transform(img).unsqueeze(0)

        with torch.no_grad():
            outputs = pest_model(img_tensor)
            _, predicted = torch.max(outputs.data, 1)
            pest = pest_classes[predicted.item()]
            pest_key = pest.lower().strip()

            pesticide = pest_map.get(pest_key, "No Recommendation")

        return JSONResponse(content={"pest": pest, "pesticide": pesticide})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ Predict nutrient deficiency

@app.post("/predict_nutrient_deficiency")
async def predict_nutrient_deficiency(
    image: UploadFile = File(...),
    mobile_number: str = Form(...),
    email: str = Form(...)
):
    try:
        # Load image from upload
        input_image = Image.open(image.file).convert("RGB")
        img_array = np.array(input_image)

        # Convert to grayscale
        if len(img_array.shape) == 3:
            img_gray = img_array.mean(axis=2)
        else:
            img_gray = img_array

        # Normalize to 0-1
        img_norm = (img_gray - img_gray.min()) / (img_gray.max() - img_gray.min())

        # Medium-intensity "red" range in jet colormap
        medium_red_min = 0.75
        medium_red_max = 0.9
        mask = (img_norm >= medium_red_min) & (img_norm <= medium_red_max)

        # Label connected regions
        labeled, num_features = ndimage.label(mask)
        slices = ndimage.find_objects(labeled)

        # Prepare region info and WhatsApp-style messages
        regions = []
        messages = []
        for idx, sl in enumerate(slices, 1):
            y, x = sl
            box = {
                "x_start": int(x.start),
                "x_stop": int(x.stop),
                "y_start": int(y.start),
                "y_stop": int(y.stop)
            }
            regions.append(box)
            msg = (
                f"🟩 Region {idx}: Possible nutrient deficiency detected in area "
                f"({box['x_start']},{box['y_start']}) to ({box['x_stop']},{box['y_stop']}). "
                "Please inspect this region and consider soil testing or targeted fertilization."
            )
            messages.append(msg)

        # Generate WhatsApp link for user to send message
        if messages:
            message_text = "\n".join(messages)
            import requests
            whatsapp_url = f"https://wa.me/{mobile_number}?text={requests.utils.quote(message_text)}"
        else:
            whatsapp_url = None

        # Send email notification
        if email:
            try:
                msg = MIMEText(message_text)
                msg['Subject'] = "Crop Nutrient Deficiency Alert"
                msg['From'] = "your_email@example.com"  # Replace with your sender email
                msg['To'] = email

                smtp_server = "smtp.gmail.com"  # Gmail SMTP server
                smtp_port = 587
                smtp_user = "sanjairajaganapathi12345@gmail.com"  # Your Gmail address
                smtp_pass = "jhywrwrmrbdxlebs"     # Gmail App Password (not your regular password)

                with smtplib.SMTP(smtp_server, smtp_port) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(msg['From'], [msg['To']], msg.as_string())
            except Exception as mail_error:
                print(f"Email send error: {mail_error}")

        return JSONResponse(content={
            "medium_red_region_count": len(regions),
            "regions": regions,
            "whatsapp_messages": messages,
            "whatsapp_url": whatsapp_url,
            "email_sent_to": email
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Predict disease and provide explanation
@app.post("/disease-prediction")
async def predict_disease(image: UploadFile = File(...)):
    try:
        # Validate file type
        if not image.filename.lower().endswith(("png", "jpg", "jpeg")):
            raise HTTPException(status_code=400, detail="Invalid file type")

        # Read image file into memory
        img_bytes = await image.read()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img = img.resize((128, 128))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0).astype("float32")

        print("Image array shape:", img_array.shape)

        prediction = model_disease.predict(img_array)
        predicted_class = int(np.argmax(prediction))
        predicted_label = disease_class_labels.get(predicted_class, "Unknown Disease")

        # Gemini explanation
        explanation = chat_bot(predicted_label)

        return JSONResponse(content={
            "disease": predicted_label,
            "explanation": explanation
        })
    except Exception as e:
        print("Error in /disease-prediction:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

def chat_bot(dis):
    query = f"Explain about disease {dis} and give the precaution in 5 lines clearly in simple way"
    response = chat.send_message(query)
    result = response.text
    return result

@app.post("/chatbot")
async def chatbot_endpoint(req: Request):
    try:
        body = await req.json()
        user_message = body.get("message", "")

        # Human-friendly prompt
        prompt = f"""
You are Agro, an AI assistant for the AI Crop Monitoring System.
Follow these rules:
{chr(10).join(RULES_DATA['rules'])}

Respond in a friendly, human-like, conversational tone.
Use bullet points or numbered lists if listing features or steps.
Keep answers concise, 2-5 sentences max.
Do not repeat your name in every message.
If user asks for something outside your scope, politely tell them.

User: {user_message}
Agro:
"""

        response = aimodel.generate_content(prompt)
        return JSONResponse(content={"reply": response.text.strip()})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ========== RUN ==========
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
