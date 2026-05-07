import json
import asyncio
from ml.antares_client import fetch_list, fetch_detail
from ml.db_client import get_last_ct
from database import save_data
from routes.ml import predict
from routes.telegram import send_telegram

from models import SensorInput

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

async def poll_antares():
    """
    Continuously poll Antares for new sensor data and process it.
    This function runs indefinitely and should be started as a background task.
    """
    print("[SCHEDULER_ANTARES] Starting Antares polling service...")
    
    while True:
        try:
            #Get list of URIs from Antares
            uris = fetch_list()
            
            #loop through each URI to get details
            if uris:
                last_ct = get_last_ct()  # ambil ct terakhir dari database
                print(f"[SCHEDULER_ANTARES] Last ct from database: {last_ct}")
                new_data_count = 0
                
                for uri in uris:
                    try:
                        cin = fetch_detail(uri)
                        ct = cin["ct"]
                        

                        # dedup database
                        if last_ct and ct <= last_ct:
                            continue # sudah ada di database, skip

                        sensor = json.loads(cin["con"])

                        payload = {
                            "ph": sensor["ph"],
                            "tds": sensor["tds"],
                            "temperature": sensor["temperature"],
                            "timestamp": sensor.get("timestamp"),
                            "ct": ct
                        }
                        
                        print(f"[SCHEDULER_ANTARES] Processing new data with ct: {ct}")
                        
                        data = SensorInput(
                                ph=payload["ph"],
                                tds=payload["tds"],
                                temperature=payload["temperature"]
                            )

                        if payload:
                            prediction_result = await predict(data)
                            suggest = water_suggestion(data.ph, data.tds, data.temperature)
                            print(f"[SCHEDULER_ANTARES] Prediction: {prediction_result}")
                            print(f"[SCHEDULER_ANTARES] Suggestion: {suggest}")
                            
                            # Extract status and suggestion from prediction result
                            payload["status"] = prediction_result["status"]
                            payload["suggestion"] = suggest

                            save_data(payload)
                            print(f"[SCHEDULER_ANTARES] Data saved to database: {payload}")
                            
                            # Send Telegram notification if water status is not normal
                            water_status = prediction_result["status"].lower()
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
                                    print(f"[SCHEDULER_ANTARES] Telegram alert sent for abnormal water quality")
                                else:
                                    print(f"[SCHEDULER_ANTARES] Failed to send Telegram alert")
                            
                            new_data_count += 1

                        await asyncio.sleep(2)  # delay between requests to avoid rate limiting
                        
                    except Exception as e:
                        print(f"[SCHEDULER_ANTARES] Error processing URI {uri}: {str(e)}")
                        continue
                
                if new_data_count == 0:
                    print("[SCHEDULER_ANTARES] No new data found")
                else:
                    print(f"[SCHEDULER_ANTARES] Processed {new_data_count} new records")
            else:
                print("[SCHEDULER_ANTARES] No URIs found from Antares")
                
        except Exception as e:
            print(f"[SCHEDULER_ANTARES] Error in polling cycle: {str(e)}")
        
        # Wait before next polling cycle (30 seconds)
        print("[SCHEDULER_ANTARES] Waiting 30 seconds before next poll...")
        await asyncio.sleep(30)