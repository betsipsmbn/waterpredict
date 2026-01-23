import pandas as pd
import cx_Oracle
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_connection():
    """Get Oracle database connection using environment variables"""
    dsn = cx_Oracle.makedsn(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        service_name=os.getenv("DB_SERVICE_NAME")
    )
    conn = cx_Oracle.connect(
        user=os.getenv("DB_USERNAME"),
        password=os.getenv("DB_PASSWORD"),
        dsn=dsn
    )
    return conn

def load_data():
    """Load training data from Oracle database"""
    conn = get_db_connection()

    query = """
    SELECT WATER_PH as PH, WATER_TDS as TDS, WATER_SUHU as TEMPERATURE, WATER_STATUS as STATUS, WATER_SUGGEST as SUGGEST
    FROM WATER_DATA_SENSOR
    WHERE WATER_STATUS IS NOT NULL
    """

    df = pd.read_sql(query, conn)
    conn.close()
    return df

#Menyimpan data yang ada di antares ke database oracle
def save_data(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if ct already exists
    cursor.execute("SELECT 1 FROM WATER_DATA_SENSOR WHERE ct = :ct", [data['ct']])
    exists = cursor.fetchone() is not None
    
    if exists:
        cursor.close()
        conn.close()
        return False  # sudah ada, skip
    
    # Insert new data
    insert_sql = """
    INSERT INTO WATER_DATA_SENSOR (DATECREATED, PROCESSBY, WATER_PH, WATER_TDS, WATER_SUHU, WATER_TIMESTAMP, ct, WATER_STATUS, WATER_SUGGEST)
    VALUES (SYSDATE, 'ANTARES-API', :ph, :tds, :temperature, TO_TIMESTAMP(:timestamp, 'YYYY-MM-DD HH24:MI:SS'), :ct, :status, :suggest)
    """
    
    cursor.execute(insert_sql, {
        'ph': data['ph'],
        'tds': data['tds'],
        'temperature': data['temperature'],
        'timestamp': data['timestamp'] or '',
        'ct': data['ct'],
        'status': data['status'],
        'suggest': data['suggestion']
    })
    
    conn.commit()
    cursor.close()
    conn.close()
    return True  # berhasil insert