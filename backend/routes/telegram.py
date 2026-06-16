import requests
import asyncio
from routes.datasensor import get_telebot_data

async def send_telegram(message):
    try:
        # Get telegram config from database (async)
        result = await get_telebot_data()
        
        print(f"Telegram config result: {result}")
        
        # Check if data exists
        if not result or result.get("status") != "success" or not result.get("data"):
            print("No telegram configuration found")
            return False
            
        config = result["data"][0]
        
        # Check if telegram is enabled
        if config.get("tele_enable") == "N":
            print("Telegram notifications disabled")
            return False
            
        bot_token = config.get("tele_token")
        chat_id = config.get("tele_chat_id")
        
        # Check required fields
        if not bot_token or not chat_id:
            print("Missing bot token or chat ID")
            return False
        
        # Send message
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message
        }
        response = requests.post(url, data=payload)
        result = response.json()
        
        if result.get("ok"):
            print("Telegram message sent successfully")
            return True
        else:
            print(f"Telegram error: {result}")
            return False
            
    except Exception as e:
        print(f"Error sending telegram: {str(e)}")
        return False

