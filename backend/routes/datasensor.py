from ml.antares_client import fetch_latest
from fastapi import APIRouter, HTTPException, Query
from database import get_db_connection
from datetime import datetime, timedelta


router = APIRouter()

@router.get("/ListDataSensor")
async def list_datasensor():
    try:
        # Get database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Query to get all users (sample query - you can update this)
            list_data_query = """
            SELECT DATECREATED, WATER_PH, WATER_TDS, WATER_SUHU, 
            WATER_STATUS, WATER_SUGGEST, WATER_TIMESTAMP
            FROM WATER_DATA_SENSOR
            WHERE PROCESSBY ='ANTARES-API'
            ORDER BY WATER_TIMESTAMP DESC
            """
            
            cursor.execute(list_data_query)
            data_records = cursor.fetchall()

            # Convert records to list of dictionaries
            datasensor_list = []
            for record in data_records:
                datecreated, water_ph, water_tds, water_suhu, water_status, water_suggest, water_timestamp = record
                datasensor_list.append({
                    "datecreated": datecreated,
                    "water_ph": water_ph,
                    "water_tds": water_tds,
                    "water_suhu": water_suhu,
                    "water_status": water_status,
                    "water_suggest": water_suggest,
                    "water_timestamp": water_timestamp
                })
            
            return {
                "status": "success",
                "message": "List Sensor Data retrieved successfully!",
                "success": True,
                "data": datasensor_list,
                "total": len(datasensor_list)
            }
            
        finally:
            cursor.close()
            conn.close()
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving users: {str(e)}"
        )


@router.get("/ListDataSensor24Hours")
async def list_datasensor_24hours():
    try:
        # Get database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Base query to get data from last 24 hours
            base_query = """
            SELECT DATECREATED, WATER_PH, WATER_TDS, WATER_SUHU, 
            WATER_STATUS, WATER_SUGGEST, WATER_TIMESTAMP
            FROM WATER_DATA_SENSOR
            WHERE PROCESSBY = 'ANTARES-API' 
            AND WATER_TIMESTAMP >= SYSDATE - INTERVAL '24' HOUR
            """
            
            # Add user's custom query conditions if provided
            # if query and query.strip():
            #     # Sanitize and add the custom query condition
            #     base_query += f" AND ({query})"
            
            # Order by timestamp descending
            base_query += " ORDER BY WATER_TIMESTAMP DESC"
            
            cursor.execute(base_query)
            data_records = cursor.fetchall()

            # Convert records to list of dictionaries
            datasensor_list = []
            for record in data_records:
                datecreated, water_ph, water_tds, water_suhu, water_status, water_suggest, water_timestamp = record
                datasensor_list.append({
                    "datecreated": datecreated,
                    "water_ph": water_ph,
                    "water_tds": water_tds,
                    "water_suhu": water_suhu,
                    "water_status": water_status,
                    "water_suggest": water_suggest,
                    "water_timestamp": water_timestamp
                })
            
            return {
                "status": "success",
                "message": "Sensor data from last 24 hours retrieved successfully!",
                "success": True,
                "data": datasensor_list,
                "total": len(datasensor_list),
                "time_range": "Last 24 hours"
            }
            
        finally:
            cursor.close()
            conn.close()
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving 24-hour sensor data: {str(e)}"
        )
    
@router.get("/DataSensorLatest")
async def get_latest_data():
    try:
        # Get database connection
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            # Base query to get data from last 24 hours
            base_query = """
            SELECT WATER_PH, WATER_TDS, WATER_SUHU, WATER_STATUS, WATER_SUGGEST, WATER_TIMESTAMP
            FROM WATER_DATA_SENSOR
            WHERE WATER_TIMESTAMP is not null
            ORDER BY WATER_TIMESTAMP DESC
            FETCH FIRST 1 ROW ONLY
            """
            cur.execute(base_query)
            row = cur.fetchone()

            if not row:
                return None

            # Convert records to list of dictionaries
            datasensor_latest = []
            water_ph, water_tds, water_suhu, water_status, water_suggest, water_timestamp = row
            
            datasensor_latest.append({
                    "water_ph": water_ph,
                    "water_tds": water_tds,
                    "water_suhu": water_suhu,
                    "water_status": water_status,
                    "water_suggest": water_suggest,
                    "water_timestamp": water_timestamp
                })

            return {
                "status": "success",
                "message": "Sensor data latest retrieved successfully!",
                "success": True,
                "data": datasensor_latest
            }
            
        finally:
            cur.close()
            conn.close()
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving 24-hour sensor data: {str(e)}"
        )

@router.get("/DataSensorLatestAntares")
async def get_latest_data_antares():
    try:
        data = fetch_latest()
        return {
            "status": "success",
            "message": "Latest sensor data from Antares retrieved successfully!",
            "success": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving latest sensor data from Antares: {str(e)}"
        )
    
@router.get("/DataTeleBot")
async def get_telebot_data():
    try:
        # Get database connection
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            # Base query to get data from last 24 hours
            base_query = """
            SELECT TELE_TOKEN, TELE_CHAT_ID, TELE_ENABLE, TELE_USERNAME
            FROM WATER_TELE_CONFIG
            """
            cur.execute(base_query)
            row = cur.fetchone()

            if not row:
                return None

            # Convert records to list of dictionaries
            dataconfig_telebot = []
            TELE_TOKEN, TELE_CHAT_ID, TELE_ENABLE, TELE_USERNAME = row
            
            dataconfig_telebot.append({
                    "tele_token": TELE_TOKEN,
                    "tele_chat_id": TELE_CHAT_ID,
                    "tele_enable": TELE_ENABLE,
                    "tele_username": TELE_USERNAME
                })

            return {
                "status": "success",
                "message": "Data Config from Telegram Bot retrieved successfully!",
                "success": True,
                "data": dataconfig_telebot
            }
            
        finally:
            cur.close()
            conn.close()
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving data config from Telegram Bot: {str(e)}"
        )

@router.post("/UpdateTelegramConfig")
async def update_telegram_config(
    tele_token: str = "",
    tele_chat_id: str = "",
    tele_enable: str = "N",
    tele_username: str = ""
):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            # Check if config exists
            check_query = "SELECT COUNT(*) FROM WATER_TELE_CONFIG"
            cur.execute(check_query)
            exists = cur.fetchone()[0] > 0
            
            if exists:
                # Update existing config
                update_query = """
                UPDATE WATER_TELE_CONFIG 
                SET TELE_TOKEN = :token, TELE_CHAT_ID = :chat_id, 
                    TELE_ENABLE = :enable, TELE_USERNAME = :username
                """
                cur.execute(update_query, {
                    'token': tele_token,
                    'chat_id': tele_chat_id, 
                    'enable': tele_enable,
                    'username': tele_username
                })
            else:
                # Insert new config
                insert_query = """
                INSERT INTO WATER_TELE_CONFIG 
                (TELE_TOKEN, TELE_CHAT_ID, TELE_ENABLE, TELE_USERNAME) 
                VALUES (:token, :chat_id, :enable, :username)
                """
                cur.execute(insert_query, {
                    'token': tele_token,
                    'chat_id': tele_chat_id,
                    'enable': tele_enable, 
                    'username': tele_username
                })
            
            conn.commit()
            
            return {
                "status": "success",
                "message": "Telegram configuration updated successfully!",
                "success": True
            }
            
        finally:
            cur.close()
            conn.close()
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating telegram configuration: {str(e)}"
        )
