import joblib
import numpy as np
import pandas as pd
from config import FEATURE_COLUMNS, LABELS, MODEL_FILE

# evaluate_model.py — Tests the saved model.pkl with custom inputs
#
# Use this file anytime you want to manually test a prediction
# without running the full Flask server.
# On Day 7 the Flask API does exactly what this script does
# but receives the sensor values from the phone instead.

print("🧪 SafeDrive Model Evaluator")
print("=" * 45)

# ── LOAD THE SAVED MODEL ───────────────────────────────────
try:
    model = joblib.load(MODEL_FILE)
    print(f"✅ Loaded model from {MODEL_FILE}")
    print(f"   Trees in forest: {model.n_estimators}")
    print(f"   Classes: {[LABELS[i] for i in model.classes_]}")
except FileNotFoundError:
    print(f"❌ {MODEL_FILE} not found!")
    print("   Run train_model.py first: python train_model.py")
    exit()

print()

# ── PREDICTION FUNCTION ────────────────────────────────────
def predict(sensor_data: dict) -> dict:
    """
    Takes raw sensor data and returns activity prediction.

    sensor_data should have keys:
        accel_x, accel_y, accel_z (accelerometer)
        gyro_x, gyro_y, gyro_z   (gyroscope)
        speed                     (GPS speed in km/h)

    Returns:
        activity   — 'sitting', 'walking', or 'driving'
        confidence — how confident the model is (0.0 to 1.0)
        all_probs  — confidence for each class
    """

    # Calculate engineered features from raw values
    ax, ay, az = sensor_data['accel_x'], sensor_data['accel_y'], sensor_data['accel_z']
    gx, gy, gz = sensor_data['gyro_x'], sensor_data['gyro_y'], sensor_data['gyro_z']
    speed = sensor_data['speed']

    accel_magnitude = np.sqrt(ax**2 + ay**2 + az**2)
    gyro_magnitude = np.sqrt(gx**2 + gy**2 + gz**2)
    speed_category = 0 if speed < 2 else (1 if speed < 15 else 2)

    # Build the full feature row
    features = pd.DataFrame([{
        'accel_x': ax, 'accel_y': ay, 'accel_z': az,
        'gyro_x': gx, 'gyro_y': gy, 'gyro_z': gz,
        'speed': speed,
        'accel_magnitude': accel_magnitude,
        'gyro_magnitude': gyro_magnitude,
        'speed_category': speed_category,
    }])[FEATURE_COLUMNS]

    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = probabilities[prediction]

    return {
        'activity': LABELS[prediction],
        'label': int(prediction),
        'confidence': round(float(confidence), 4),
        'all_probs': {
            LABELS[i]: round(float(p), 4)
            for i, p in enumerate(probabilities)
        }
    }


# ── TEST SCENARIOS ─────────────────────────────────────────
# These simulate what the phone will send to the Flask API

test_cases = [
    {
        'name': '😴 Sitting at desk',
        'data': {
            'accel_x': 0.05, 'accel_y': 0.02, 'accel_z': 9.81,
            'gyro_x': 0.01, 'gyro_y': 0.00, 'gyro_z': 0.01,
            'speed': 0.0
        }
    },
    {
        'name': '🚶 Walking slowly',
        'data': {
            'accel_x': 1.1, 'accel_y': 1.7, 'accel_z': 9.3,
            'gyro_x': 0.4, 'gyro_y': 0.3, 'gyro_z': 0.2,
            'speed': 4.5
        }
    },
    {
        'name': '🚗 Driving in city',
        'data': {
            'accel_x': 1.8, 'accel_y': 1.2, 'accel_z': 9.7,
            'gyro_x': 0.7, 'gyro_y': 0.5, 'gyro_z': 0.8,
            'speed': 45.0
        }
    },
    {
        'name': '🏎️  Driving on highway',
        'data': {
            'accel_x': 2.5, 'accel_y': 1.8, 'accel_z': 9.5,
            'gyro_x': 1.0, 'gyro_y': 0.7, 'gyro_z': 0.9,
            'speed': 95.0
        }
    },
    {
        'name': '🚌 Passenger in bus',
        'data': {
            'accel_x': 1.5, 'accel_y': 2.0, 'accel_z': 9.4,
            'gyro_x': 0.6, 'gyro_y': 0.4, 'gyro_z': 0.7,
            'speed': 35.0
        }
    },
]

print("🎯 PREDICTION RESULTS:")
print()

for test in test_cases:
    result = predict(test['data'])

    # Emoji for each activity
    emojis = {'sitting': '🪑', 'walking': '🚶', 'driving': '🚗'}
    activity_emoji = emojis.get(result['activity'], '❓')

    print(f"  {test['name']}")
    print(f"    Prediction : {activity_emoji} {result['activity'].upper()}")
    print(f"    Confidence : {result['confidence'] * 100:.1f}%")
    print(f"    All probs  : ", end="")
    for act, prob in result['all_probs'].items():
        print(f"{act}={prob*100:.0f}%  ", end="")
    print()
    print()

print("=" * 45)
print("✅ Model evaluation complete!")
print("▶️  Next: Day 7 — Build Flask API")
print("=" * 45)