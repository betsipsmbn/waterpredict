import json
import asyncio
from ml.antares_client import fetch_list, fetch_detail
from ml.db_client import get_last_ct
from database import save_data
from routes.ml import predict

from models import SensorInput

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
    #Get list of URIs from Antares
    uris= fetch_list()

    #loop through each URI to get details
    if uris:
        last_ct = get_last_ct()  # ambil ct terakhir dari database
        #print("Last ct from database:", last_ct)
        for uri in uris:
                    cin = fetch_detail(uri)
                    ct = cin["ct"]
                    #print("Processing ct:", ct)

                    # dedup database
                    if last_ct and ct <= last_ct:
                        continue # sudah ada di database, skip

                    sensor = json.loads(cin["con"])

                    payload = {
                        "ph": sensor["ph"],
                        "tds": sensor["tds"],
                        "temperature": sensor["temperature"],
                        "timestamp": sensor.get("timestamp") or None,
                        "ct": ct
                    }
                    
                    #print("Payload:", payload)
                    
                    data = SensorInput(
                            ph=payload["ph"],
                            tds=payload["tds"],
                            temperature=payload["temperature"]
                        )

                    if (payload):
                        prediction_result = await predict(data)
                        suggest = water_suggestion(data.ph, data.tds, data.temperature)
                        print("Prediction:", prediction_result)
                        print("Suggestion:", suggest)
                        
                        # Extract status and suggestion from prediction result
                        payload["status"] = prediction_result["status"]
                        payload["suggestion"] = suggest

                        save_data(payload)
                        print("Data saved to database:", payload)

                    await asyncio.sleep(10)  # delay between requests to avoid rate limiting