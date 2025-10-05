from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import close_db
from app.routes.crop_routes import router as crop_router
from app.routes.pest_routes import router as pest_router
from app.routes.nutrient_routes import router as nutrient_router
from app.routes.disease_routes import router as disease_router
from app.routes.chatbot_routes import router as chatbot_router

settings = get_settings()

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(crop_router)
app.include_router(pest_router)
app.include_router(nutrient_router)
app.include_router(disease_router)
app.include_router(chatbot_router)


@app.on_event("shutdown")
async def shutdown_event():
    await close_db()
