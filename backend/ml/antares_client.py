import requests
import os, json
# from database import save_data
# from backend.routes.ml import predict
from dotenv import load_dotenv

#function to fetch data from Antares

load_dotenv()

ACCESS_KEY = os.getenv("ANTARES_ACCESS_KEY")
APP = os.getenv("ANTARES_PROJECT")
DEVICE = os.getenv("ANTARES_DEVICE")

URL = f"https://platform.antares.id:8443/~/antares-cse/antares-id/{APP}/{DEVICE}/la"
LIST_URL = f"https://platform.antares.id:8443/~/antares-cse/antares-id/{APP}/{DEVICE}?fu=1&ty=4"

HEADERS = {
    "X-M2M-Origin": ACCESS_KEY,
    "Accept": "application/json"
}

# Fetch the latest data from Antares
def fetch_latest():
    res = requests.get(URL, headers=HEADERS)
    res.raise_for_status()
    data = res.json()
    con = data["m2m:cin"]["con"]
    #date = data["m2m:cin"]["ct"]
    #print("Data sensor:", con, ", ct:", date)
    return eval(con)

#fetch list of URIs from Antares
def fetch_list():
    res = requests.get(LIST_URL, headers=HEADERS)
    res.raise_for_status()
    data = res.json()
    lists = data["m2m:uril"]
    #print("List of URIs:", lists)
    return res.json()["m2m:uril"]

#fetch detail data from Antares based on URI
def fetch_detail(uri):
    url = f"https://platform.antares.id:8443/~{uri}"
    res = requests.get(url, headers=HEADERS)
    res.raise_for_status()
    return res.json()["m2m:cin"]



#data = fetch_latest()
#print("Latest data from Antares:", data)