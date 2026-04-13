from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os
import time
from datetime import datetime
from config import FEATURE_COLUMNS, LABELS, MODEL_FILE, CONFIDENCE_THRESHOLD

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

print("🚗 SafeDrive Backend Starting...")
print("=" * 45)

MODEL_LOADED = False
model = None

try:
    model = joblib.load(MODEL_FILE)
    MODEL_LOADED = True
    print(f"✅ ML Model loaded: {MODEL_FILE}")
except FileNotFoundError:
    print(f"⚠️  {MODEL_FILE} not found! Run: python train_model.py")

prediction_history = []

def engineer_features(ax, ay, az, gx, gy, gz, speed):
    accel_magnitude = np.sqrt(ax**2 + ay**2 + az**2)
    gyro_magnitude = np.sqrt(gx**2 + gy**2 + gz**2)
    speed_category = 0 if speed < 2 else (1 if speed < 15 else 2)
    return pd.DataFrame([{
        'accel_x': ax, 'accel_y': ay, 'accel_z': az,
        'gyro_x': gx, 'gyro_y': gy, 'gyro_z': gz,
        'speed': speed,
        'accel_magnitude': accel_magnitude,
        'gyro_magnitude': gyro_magnitude,
        'speed_category': speed_category,
    }])[FEATURE_COLUMNS]

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'running',
        'app': 'SafeDrive Backend',
        'version': '1.0.0',
        'model_loaded': MODEL_LOADED,
        'timestamp': datetime.now().isoformat(),
    })

@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        'model_loaded': MODEL_LOADED,
        'prediction_count': len(prediction_history),
        'endpoints': {
            'GET  /': 'Health check',
            'POST /predict': 'Classify activity from sensors',
            'POST /attention': 'Detect distraction (Day 11)',
            'GET  /history': 'Last 10 predictions',
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    if not MODEL_LOADED:
        return jsonify({'error': 'Model not loaded. Run train_model.py first'}), 500

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data received'}), 400

    required_fields = ['accel_x','accel_y','accel_z','gyro_x','gyro_y','gyro_z','speed']
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({'error': f'Missing fields: {missing}'}), 400

    try:
        ax, ay, az = float(data['accel_x']), float(data['accel_y']), float(data['accel_z'])
        gx, gy, gz = float(data['gyro_x']), float(data['gyro_y']), float(data['gyro_z'])
        speed = float(data['speed'])

        features = engineer_features(ax, ay, az, gx, gy, gz, speed)

        start_time = time.time()
        prediction = int(model.predict(features)[0])
        probabilities = model.predict_proba(features)[0]
        inference_time = (time.time() - start_time) * 1000

        activity = LABELS[prediction]
        confidence = float(probabilities[prediction])
        all_probs = {LABELS[i]: round(float(p), 4) for i, p in enumerate(probabilities)}

        result = {
            'activity': activity,
            'label': prediction,
            'confidence': round(confidence, 4),
            'all_probabilities': all_probs,
            'is_driving': activity == 'driving' and confidence >= CONFIDENCE_THRESHOLD,
            'inference_ms': round(inference_time, 2),
            'timestamp': datetime.now().isoformat(),
        }

        prediction_history.append({
            'activity': activity,
            'confidence': confidence,
            'speed': speed,
            'timestamp': result['timestamp'],
        })
        if len(prediction_history) > 10:
            prediction_history.pop(0)

        print(f"[{datetime.now().strftime('%H:%M:%S')}] "
              f"→ {activity:10} ({confidence*100:.1f}%) speed={speed:.1f}km/h")

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/attention', methods=['POST'])
def attention():
    return jsonify({
        'distracted': False,
        'message': 'Camera attention monitoring coming Day 11',
    })

@app.route('/history', methods=['GET'])
def history():
    return jsonify({
        'count': len(prediction_history),
        'predictions': prediction_history
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=True)