from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from ml.training_service import train_model

import os

scheduler = BackgroundScheduler()

def scheduled_training():
    acc = train_model()
    print(f"[{__name__}] Training completed, accuracy={acc}")

scheduler.add_job(
    scheduled_training,
    CronTrigger(hour=2, minute=0) 
)

print("ENABLE_SCHEDULER =", os.getenv("ENABLE_SCHEDULER"))

if os.getenv("ENABLE_SCHEDULER", "false").lower() == "true":
    scheduler.start()
    print(f"[{__name__}] SCHEDULER STARTED SUCCESSFULLY!")  # ✅ ini tanda scheduler jalan