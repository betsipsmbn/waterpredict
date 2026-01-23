import joblib

from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.metrics import accuracy_score

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
    model.fit(X_train, y_train)

    # Prediksi
    y_pred = model.predict(X_test)

    # Accuracy per output
    acc_status = accuracy_score(y_test["STATUS"], y_pred[:,0])
    #acc_suggestion = accuracy_score(y_test["SUGGEST"], y_pred[:,1])

    # Save model & scaler
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    # Return accuracy
    result = {
        "accuracy_status": round(float(acc_status), 3),
        #"accuracy_suggestion": round(float(acc_suggestion), 3)
    }
    print(result)
    return result
