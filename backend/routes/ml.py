from fastapi import APIRouter, HTTPException
import numpy as np
import joblib

from models import SensorInput, MODEL_PATH, SCALER_PATH
from ml.training_service import train_model

router = APIRouter()

@router.post("/training")
async def train():
    """Train the water quality prediction model"""
    try:

        acc = train_model()

        return {
            "message": "Training completed",
            "accuracy_status": acc["accuracy_status"],
            #"accuracy_suggestion": acc["accuracy_suggestion"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during model training: {str(e)}"
        )

@router.post("/predict")
async def predict(data: SensorInput):
    """Predict water quality based on sensor input"""
    try:
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)

        X = np.array([[data.ph, data.tds, data.temperature]])
        X_scaled = scaler.transform(X)

        pred = model.predict(X_scaled)[0]
        status_pred = str(pred[0])
        #suggestion_pred = str(pred[1])

        #return {"prediction":(pred)}
        # Hanya tampilkan suggestion jika status Tidak Layak
        response = {"status": status_pred,
                    #"suggestion": suggestion_pred
                    }
        

        return response
    
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Model not found. Please train the model first using /training endpoint"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during prediction: {str(e)}"
        )