from pydantic import BaseModel
import os

class SensorInput(BaseModel):
    ph: float
    tds: float
    temperature: float

# Model and scaler file paths
# Get the directory where this models.py file is located (backend directory)
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BACKEND_DIR, "model.pkl")
SCALER_PATH = os.path.join(BACKEND_DIR, "scaler.pkl")