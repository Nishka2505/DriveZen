# config.py — Shared settings used across all backend files
#
# Why have a config file?
# If we hardcode values like feature names in 5 different files,
# changing one thing means editing 5 files and missing some.
# Putting everything here means we change it once and it updates everywhere.

# ── ACTIVITY LABELS ───────────────────────────────────────
# These must match the labels in collect_data.py
LABELS = {
    0: 'sitting',
    1: 'walking',
    2: 'driving',
}

LABEL_NAMES = ['sitting', 'walking', 'driving']

# ── FEATURES ──────────────────────────────────────────────
# These are the columns the ML model uses to make predictions
# Must match exactly what collect_data.py generates
# AND what the Flask API receives from the phone

FEATURE_COLUMNS = [
    'accel_x',
    'accel_y',
    'accel_z',
    'gyro_x',
    'gyro_y',
    'gyro_z',
    'speed',
    'accel_magnitude',
    'gyro_magnitude',
    'speed_category',
]

# ── THRESHOLDS ────────────────────────────────────────────
# Speed thresholds for Drive Mode auto-activation
DRIVING_SPEED_THRESHOLD = 15.0   # km/h — above this = driving
WALKING_SPEED_MAX = 7.0          # km/h — above this = not walking

# Confidence threshold — how sure the model must be to classify
# e.g. 0.6 means model must be 60%+ confident or it returns 'unknown'
CONFIDENCE_THRESHOLD = 0.6

# ── SENSOR SETTINGS ───────────────────────────────────────
# How often the phone sends sensor data (milliseconds)
SENSOR_UPDATE_INTERVAL = 200     # 200ms = 5 times per second

# ── MODEL FILE ────────────────────────────────────────────
MODEL_FILE = 'model.pkl'
DATASET_FILE = 'dataset.csv'