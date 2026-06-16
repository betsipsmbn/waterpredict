import firebase_admin
import time
from pathlib import Path
from firebase_admin import credentials
from firebase_admin import db
from fastapi import APIRouter, HTTPException
import json
import requests

# Load credential
BASE_DIR = Path(__file__).resolve().parents[1]
cred_path = BASE_DIR / "firebase-keywaterpred.json"
cred = credentials.Certificate(str(cred_path))

# Initialize app
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://wq-monitoring-cf223-default-rtdb.asia-southeast1.firebasedatabase.app/'
    })

# Reference ke database
ref = db.reference('water_quality')

# Insert data
# ref.push({
#     'ph': 5.3248,
#     'td': 97.8512,
#     'temperature': 28,
#     'timestamp': time.strftime("%Y-%m-%d %H:%M:%S")
# })

# print("Data berhasil ditambahkan")

#get all data
# data = ref.get()
# result = list(data.values())

# print("All data from Firebase:", result)

router = APIRouter()


def _require_float(value, field_name: str) -> float:
    if value is None:
        raise ValueError(f"Missing field: {field_name}")
    return float(value)


def _build_sensor_data(result: dict):
    # Firebase payload may use either "td" or "tds" depending on writer source.
    tds_value = result.get("td")
    if tds_value is None:
        tds_value = result.get("tds")

    return {
        "ph": _require_float(result.get("ph"), "ph"),
        "tds": _require_float(tds_value, "td/tds"),
        "temperature": _require_float(result.get("temperature"), "temperature"),
        "timestamp": result.get("timestamp")
    }

@router.get("/all-sensor-data_firebase")
def get_all_sensor_data():
    try:
        data = ref.get()
        if not data:
            raise HTTPException(status_code=404, detail="No sensor data found")

        results = list(data.values())
        sensor_data_list = []
        skipped_count = 0

        for result in results:
            try:
                sensor_data = _build_sensor_data(result)
                sensor_data_list.append(sensor_data)
            except (TypeError, ValueError):
                skipped_count += 1
                continue

        if not sensor_data_list:
            raise HTTPException(status_code=404, detail="No valid sensor data found")

        # print("All sensor data count:", len(sensor_data_list))
        # print("All sensor data from Firebase:", sensor_data_list)
        return {
                "status": "success",
                "message": "All sensor data retrieved successfully",
                "data": sensor_data_list,
                "count": len(sensor_data_list),
                "skipped": skipped_count
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch all sensor data: {str(e)}")

@router.get("/latest-sensor-data_firebase")
def get_latest_sensor_data():
    try:
        datas = ref.order_by_key().limit_to_last(1).get()
        if not datas:
            raise HTTPException(status_code=404, detail="No sensor data found")

        result = list(datas.values())[0]
        sensor_data = _build_sensor_data(result)

        #print("Latest data from Firebase:", sensor_data)
        return {
                "status": "success",
                "message": "Latest sensor data retrieved successfully",
                "data": sensor_data
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch latest sensor data: {str(e)}")
    

