import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_db_connection


def is_ct_exist(ct):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM WATER_DATA_SENSOR WHERE ct = :ct", [ct])
    exists = cursor.fetchone() is not None
    cursor.close()
    conn.close()
    return exists

def insert_sensor_data(ph, tds, temperature, ct, timestamp):
    if is_ct_exist(ct):
        return False  # sudah ada, skip insert

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO WATER_DATA_SENSOR (DATECREATED, PROCESSBY, WATER_PH, WATER_TDS, WATER_SUHU, WATER_STATUS, WATER_SUGGEST, ct, WATER_TIMESTAMP) VALUES (SYSDATE, 'FIREBASE-API', :ph, :tds, :suhu, :status, :suggest, :ct, :timestamp)",
        [ph, tds, temperature, None, None, ct, timestamp]
    )
    conn.commit()
    cursor.close()
    conn.close()
    return True

def get_last_ct():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(ct) FROM WATER_DATA_SENSOR")
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    return result[0] if result and result[0] else '00000000T000000'  # default jika tidak ada data
