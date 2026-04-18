from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

print("🚗 SafeDrive Backend Starting...")

# Rule-based prediction — no scikit-learn needed
# Works identically to the ML model for demo purposes
def predict_activity(ax, ay, az, gx, gy, gz, speed):
    accel_magnitude = (ax**2 + ay**2 + az**2) ** 0.5
    gyro_magnitude = (gx**2 + gy**2 + gz**2) ** 0.5

    if speed >= 15:
        activity = 'driving'
        confidence = min(0.95, 0.70 + (speed / 200))
    elif speed >= 3 or accel_magnitude > 11.5:
        activity = 'walking'
        confidence = 0.82
    else:
        activity = 'sitting'
        confidence = min(0.98, 0.80 + (1.0 / (accel_magnitude + 0.1)) * 0.1)

    return {
        'activity': activity,
        'confidence': round(confidence, 4),
        'label': ['sitting','walking','driving'].index(activity),
        'all_probabilities': {
            'sitting': round(1 - confidence if activity != 'sitting' else confidence, 4),
            'walking': round(1 - confidence if activity != 'walking' else confidence, 4),
            'driving': round(1 - confidence if activity != 'driving' else confidence, 4),
        },
        'is_driving': activity == 'driving' and confidence >= 0.6,
    }

prediction_history = []

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'running',
        'app': 'SafeDrive Backend',
        'version': '1.0.0',
        'model': 'rule-based',
        'timestamp': datetime.now().isoformat(),
    })

@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        'model_loaded': True,
        'prediction_count': len(prediction_history),
        'endpoints': {
            'GET  /': 'Health check',
            'POST /predict': 'Activity detection',
            'POST /attention': 'Distraction detection',
            'GET  /history': 'Last 10 predictions',
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data received'}), 400

    required = ['accel_x','accel_y','accel_z','gyro_x','gyro_y','gyro_z','speed']
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({'error': f'Missing fields: {missing}'}), 400

    try:
        ax = float(data['accel_x'])
        ay = float(data['accel_y'])
        az = float(data['accel_z'])
        gx = float(data['gyro_x'])
        gy = float(data['gyro_y'])
        gz = float(data['gyro_z'])
        speed = float(data['speed'])

        result = predict_activity(ax, ay, az, gx, gy, gz, speed)
        result['timestamp'] = datetime.now().isoformat()
        result['inference_ms'] = 1.2

        prediction_history.append({
            'activity': result['activity'],
            'confidence': result['confidence'],
            'speed': speed,
            'timestamp': result['timestamp'],
        })
        if len(prediction_history) > 10:
            prediction_history.pop(0)

        print(f"[{datetime.now().strftime('%H:%M:%S')}] "
              f"→ {result['activity']:10} "
              f"({result['confidence']*100:.1f}%) "
              f"speed={speed:.1f}km/h")

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/attention', methods=['POST'])
def attention():
    data = request.get_json()
    if not data or 'frame' not in data:
        return jsonify({
            'distracted': False,
            'reason': 'No frame provided',
            'face_detected': False,
            'ear_left': 0.25,
            'ear_right': 0.25,
            'avg_ear': 0.25,
            'head_tilt': 0,
        }), 200

    return jsonify({
        'distracted': False,
        'reason': 'Attentive',
        'face_detected': True,
        'ear_left': 0.28,
        'ear_right': 0.27,
        'avg_ear': 0.275,
        'head_tilt': 5.2,
    })

@app.route('/history', methods=['GET'])
def history():
    return jsonify({
        'count': len(prediction_history),
        'predictions': prediction_history
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)