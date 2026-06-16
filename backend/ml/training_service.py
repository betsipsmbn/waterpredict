import joblib

from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

from models import SensorInput, MODEL_PATH, SCALER_PATH
from database import load_data

def train_model():
    """Train the water quality prediction model"""
    
    df = load_data()

    # Features
    X = df[["PH", "TDS", "TEMPERATURE"]]

    # Labels: status + suggestion
    #y = df[["STATUS", "SUGGEST"]]
    y = df[["STATUS"]]

    # Scaling
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Split data (bisa dipakai untuk evaluasi)
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.4, random_state=42
    )

    # Multi-output Random Forest
    model = MultiOutputClassifier(RandomForestClassifier(n_estimators=100, random_state=42))
    #model = MultiOutputClassifier(RandomForestClassifier(n_estimators=50,  max_depth=2, random_state=42))
    #model = MultiOutputClassifier(RandomForestClassifier(n_estimators=5, max_depth=2, random_state=42))
    
    model.fit(X_train, y_train)

    # Prediksi
    y_pred = model.predict(X_test)

    y_true = y_test["STATUS"]
    y_pred_status = y_pred[:, 0]


    # Hitung metric
    accuracy = accuracy_score(y_true, y_pred_status)
    precision = precision_score(y_true, y_pred_status, average='weighted')
    recall = recall_score(y_true, y_pred_status, average='weighted')
    f1 = f1_score(y_true, y_pred_status, average='weighted')
    cm = confusion_matrix(y_true, y_pred_status)

    print(f"Accuracy : {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1-Score : {f1:.4f}")
    print(f"Confusion Matrix:\n{cm}")

    # Save model & scaler
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    # Return accuracy
    result = {
        "accuracy_status": round(float(accuracy), 3)*100,
        "precision_status": round(float(precision), 3)*100,
        "recall_status": round(float(recall), 3)*100,
        "f1_status": round(float(f1), 3)*100,
        "confusion_matrix": cm.tolist()
        #"accuracy_suggestion": round(float(acc_suggestion), 3)
    }
    
    print(result)
    
    return result
