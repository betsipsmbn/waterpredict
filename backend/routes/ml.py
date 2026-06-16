from turtle import pd


from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

from fastapi import APIRouter, HTTPException
import numpy as np
import joblib

import pandas as pd
import matplotlib.pyplot as plt

from models import SensorInput, MODEL_PATH, SCALER_PATH
from ml.training_service import train_model


from models import SensorInput, MODEL_PATH, SCALER_PATH
from database import load_data

router = APIRouter()

@router.post("/training")
async def train():
    """Train the water quality prediction model"""
    try:

        acc = train_model()

        return {
            "message": "Training completed",
            "accuracy_status": acc["accuracy_status"],
            "precision_status": acc["precision_status"],
            "recall_status": acc["recall_status"],
            "f1_status": acc["f1_status"],
            "confusion_matrix": acc["confusion_matrix"]
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
        # Hanya tampilkan suggestion jika status Tidak Normal
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
    

@router.post("/PengujianPohon")
async def PengujianPohon():
    try:
        hasil = []

        df = load_data()
        for n in range(1, 21):

            # Features
            X = df[["PH", "TDS", "TEMPERATURE"]]

            # Labels: status + suggestion
            #y = df[["STATUS", "SUGGEST"]]
            y = df[["STATUS"]]

            # Scaling
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            # Split data (bisa dipakai untuk evaluasi)
            X_train, X_test, y_train, y_test = train_test_split(
                X_scaled, y, test_size=0.4, random_state=42
            )

            model = MultiOutputClassifier(RandomForestClassifier(n_estimators=100,max_depth=n,random_state=42))

            model.fit(X_train, y_train)

            # Prediksi
            y_pred = model.predict(X_test)  

            y_true = y_test["STATUS"]
            y_pred_status = y_pred[:, 0]

            acc = accuracy_score(y_true, y_pred_status)
            precision = precision_score(y_true, y_pred_status, average='weighted')
            recall = recall_score(y_true, y_pred_status, average='weighted')
            f1 = f1_score(y_true, y_pred_status, average='weighted')
            

            hasil.append({
                "Jumlah Pohon": n,
                "Akurasi (%)": round(acc * 100, 2),
                "Precision (%)": round(precision * 100, 2),
                "Recall (%)": round(recall * 100, 2),
                "F1 Score (%)": round(f1 * 100, 2)
            })
            

        df_hasil = pd.DataFrame(hasil)

        print(df_hasil)

        df_hasil.to_excel("hasil_pengujian_depth.xlsx", index=False)

        # plt.figure(figsize=(10,5))
        # plt.plot(
        #         df_hasil["Jumlah Pohon"],
        #         df_hasil["Akurasi (%)"]
        #     )

        # plt.xlabel("Jumlah Pohon")
        # plt.ylabel("Akurasi (%)")
        # plt.title("Pengaruh Jumlah Pohon terhadap Akurasi Random Forest")
        # plt.grid(True)

        # plt.savefig("grafik_akurasi_random_forest.png", dpi=300)
        # plt.show()

        # best_row = df_hasil.loc[df_hasil["Akurasi (%)"].idxmax()]

        # print("Jumlah pohon terbaik :", best_row["Jumlah Pohon"])
        # print("Akurasi :", best_row["Akurasi (%)"])
        response = {"status": "Success",
                    #"suggestion": suggestion_pred
                    }
        

        return response
    

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during model training: {str(e)}"
        )