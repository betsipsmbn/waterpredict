from fastapi import APIRouter, HTTPException
from ml.antares_client import fetch_latest
import json

router = APIRouter()

@router.get("/latest-sensor-data")
async def get_latest_sensor_data():
    """
    Get the latest sensor data from Antares IoT platform
    Returns pH, TDS, and temperature readings
    """
    try:
        # Fetch latest data from Antares
        latest_data = fetch_latest()
        
        # Log the raw data structure for debugging
        print(f"Raw Antares data: {latest_data}")
        print(f"Data type: {type(latest_data)}")
        
        # Ensure we have the required sensor data
        if not isinstance(latest_data, dict):
            raise HTTPException(
                status_code=500,
                detail=f"Invalid data format received from Antares: {latest_data}"
            )
        
        # Extract sensor values - try different possible field names
        # Common field names might be: ph, tds, temperature or pH, TDS, temp, etc.

        ph_value = (latest_data.get("ph") or 
                   latest_data.get("pH") or 
                   latest_data.get("water_ph") or 
                   latest_data.get("PH"))
        
        tds_value = (latest_data.get("tds") or 
                    latest_data.get("TDS") or 
                    latest_data.get("water_tds"))
        
        temperature_value = (latest_data.get("temperature") or 
                           latest_data.get("temp") or 
                           latest_data.get("water_suhu") or 
                           latest_data.get("suhu"))
        
        sensor_data = {
            "pH": float(ph_value),
            "tds": float(tds_value),
            "temperature": float(temperature_value)
        }
        
        return {
            "status": "success",
            "message": "Latest sensor data retrieved successfully",
            "data": sensor_data
        }
        
    except Exception as e:
        print(f"Error in get_latest_sensor_data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving latest sensor data: {str(e)}"
        )