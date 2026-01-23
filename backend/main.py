import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv


# Import route modules
from routes.health import router as health_router
from routes.upload import router as upload_router
from routes.ml import router as ml_router
from routes.manageuser import router as user_router
from routes.datasensor import router as data_router
from routes.antares import router as antares_router


from ml.scheduler_antares import poll_antares

# Load environment variables from .env file
load_dotenv()

import ml.scheduler # Running Scheduler for training ML model


app = FastAPI(
    title="IoT Water Quality API",
    description="FastAPI service for water quality prediction using IoT sensor data",
    version="1.0.0"
)

#running background task to poll antares
# @app.on_event("startup")
# async def start_scheduler():
#     asyncio.create_task(poll_antares())

# Include routers
app.include_router(health_router, tags=["Health"])
app.include_router(upload_router, tags=["Upload"])
app.include_router(ml_router, tags=["Machine Learning"])
app.include_router(user_router, tags=["User Management"])
app.include_router(data_router, tags=["Data Sensor"])
app.include_router(antares_router, tags=["Antares Client"]) # data dari antares_client.py

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
