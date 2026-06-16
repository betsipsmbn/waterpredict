from datetime import datetime
import json
import asyncio
import sys
from pathlib import Path

import firebase_admin
import time
from firebase_admin import credentials
from firebase_admin import db
from datetime import datetime


from database import save_data
from routes.ml import predict
from routes.telegram import send_telegram
from routes.firebase import get_all_sensor_data
from ml.db_client import get_last_ct

from models import SensorInput

# Ensure backend root is importable when running this file directly:
# py .\ml\scheduler_pollfirebase.py
# BACKEND_DIR = Path(__file__).resolve().parents[1]
# if str(BACKEND_DIR) not in sys.path:
#     sys.path.insert(0, str(BACKEND_DIR))

# Load credential
BASE_DIR = Path(__file__).resolve().parents[1]
cred_path = BASE_DIR / "firebase-keywaterpred.json"
cred = credentials.Certificate(str(cred_path))

# Initialize app
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://wq-monitoring-cf223-default-rtdb.asia-southeast1.firebasedatabase.app/'
    })

#poll data from Antares and save to database also to get prediction result and suggestion for water quality improvement

def water_suggestion(ph, tds, temperature):
    suggestions = []

    if tds >= 500:
        suggestions.append("Tambahkan bakteri (lumpur aktif)")

    if ph < 6.5:
        suggestions.append("Tambahkan NaOH (Natrium Hidroksida)")
    elif ph > 8.5:
        suggestions.append("Tambahkan H₂SO₄ (Asam Sulfat)")

    if temperature < 20:
        suggestions.append("Optimasi suhu proses biologis")
    elif temperature > 30:
        suggestions.append("Pendinginan atau aerasi tambahan")

    if not suggestions:
        return "Monitoring (kondisi normal)"

    return "; ".join(suggestions)

async def poll_firebase():
    """
    Continuously poll Firebase for new sensor data and process it.
    This function runs indefinitely and should be started as a background task.
    """
    print("[FIREBASE] Starting Firebase polling service...")
    
    while True:
        try:
            #Get list of URIs from Firebase
            datas = get_all_sensor_data()["data"]
            
            #loop through each URI to get details
            if datas:
                last_ct = get_last_ct()  # ambil ct terakhir dari database
                print(f"[FIREBASE] Last ct from database: {last_ct}")
                new_data_count = 0
                
                for data in datas:
                    try:
                        get_date= data["timestamp"]
                        dt = datetime.strptime(get_date, "%Y-%m-%d %H:%M:%S")
                        ct = dt.strftime("%Y%m%dT%H%M%S")

                        #print("date:", get_date, ", ct:", ct)
                        

                        # dedup database
                        if last_ct and ct <= last_ct:
                            continue # sudah ada di database, skip

                        #sensor = json.loads(data["con"])

                        payload = {
                            "ph": data["ph"],
                            "tds": data["tds"],
                            "temperature": data["temperature"],
                            "timestamp": data["timestamp"],
                            "ct": ct
                        }
                        
                        print(f"[FIREBASE] Processing new data with ct: {ct}")
                        
                        data = SensorInput(
                                ph=payload["ph"],
                                tds=payload["tds"],
                                temperature=payload["temperature"]
                            )

                        if payload:
                            prediction_result = await predict(data)
                            suggest = water_suggestion(data.ph, data.tds, data.temperature)
                            print(f"[FIREBASE] Prediction: {prediction_result}")
                            print(f"[FIREBASE] Suggestion: {suggest}")
                            
                            # Extract status and suggestion from prediction result
                            payload["status"] = prediction_result["status"]
                            payload["suggestion"] = suggest

                            save_data(payload)
                            print(f"[FIREBASE] Data saved to database: {payload}")
                            
                            # Send Telegram notification if water status is not normal
                            water_status = str(prediction_result.get("status", "")).lower()
                            if water_status == "tidak layak" or water_status == "tidak normal":
                                telegram_message = (
                                    f"🚨 ALERT: Kualitas Air Tidak Normal! 🚨\n\n"
                                    f"📊 Data Sensor:\n"
                                    f"• pH: {data.ph:.2f}\n"
                                    f"• TDS: {data.tds:.0f} ppm\n"
                                    f"• Temperature: {data.temperature:.1f} °C\n"
                                    f"• Timestamp: {payload.get('timestamp', 'N/A')}\n\n"
                                    f"⚠️ Status: {prediction_result['status']}\n\n"
                                    f"💡 Saran Perbaikan:\n{suggest}\n\n"
                                    f"📍 Silakan segera lakukan tindakan perbaikan kualitas air!"
                                )
                                
                                # Send telegram notification (await since it's async)
                                telegram_sent = await send_telegram(telegram_message)
                                if telegram_sent:
                                    print(f"[FIREBASE] Telegram alert sent for abnormal water quality")
                                else:
                                    print(f"[FIREBASE] Failed to send Telegram alert")
                            
                            new_data_count += 1

                        await asyncio.sleep(2)  # delay between requests to avoid rate limiting
                        
                    except Exception as e:
                        print(f"[FIREBASE] Error processing URI {data}: {str(e)}")
                        continue
                
                if new_data_count == 0:
                    print("[FIREBASE] No new data found")
                else:
                    print(f"[FIREBASE] Processed {new_data_count} new records")
            else:
                print("[FIREBASE] No data found from Firebase")
                
        except Exception as e:
            print(f"[FIREBASE] Error in polling cycle: {str(e)}")
        
        # Wait before next polling cycle (30 seconds)
        print("[FIREBASE] Waiting 30 seconds before next poll...")
        await asyncio.sleep(30)

