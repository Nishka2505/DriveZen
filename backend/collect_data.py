import pandas as pd
import numpy as np
import os

# collect_data.py — Generates labelled sensor training data
#
# What is training data?
# A machine learning model learns by looking at thousands of examples.
# Each example has:
#   - INPUT:  sensor values (accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, speed)
#   - OUTPUT: label (0=sitting, 1=walking, 2=driving)
#
# The model studies these examples and learns patterns like:
#   "When speed > 20 AND accel values are moderate → probably driving"
#   "When all accel values are near 0 AND speed = 0 → probably sitting"
#
# We simulate realistic sensor data here because:
#   1. We don't have a labelled real-world dataset yet
#   2. Simulated data lets us control exactly what patterns to teach
#   3. Later you can replace this with real recorded data

# ── SETTINGS ──────────────────────────────────────────────
np.random.seed(42)      # Makes random numbers reproducible
SAMPLES_PER_CLASS = 500  # How many examples per activity type
OUTPUT_FILE = 'dataset.csv'

print("🧠 SafeDrive ML Data Collection Script")
print("=" * 45)
print(f"Generating {SAMPLES_PER_CLASS} samples per class...")
print()

# ── HELPER FUNCTION ────────────────────────────────────────
def generate_samples(n, label, label_name,
                     accel_x_range, accel_y_range, accel_z_range,
                     gyro_x_range, gyro_y_range, gyro_z_range,
                     speed_range, noise_level=0.05):
    """
    Generates n sensor samples for one activity type.

    Parameters:
        n            — number of samples to generate
        label        — numeric label (0, 1, or 2)
        label_name   — human readable name for printing
        accel_*_range — (min, max) tuple for each accelerometer axis
        gyro_*_range  — (min, max) tuple for each gyroscope axis
        speed_range   — (min, max) tuple for GPS speed in km/h
        noise_level   — how much random noise to add (makes data realistic)
    """

    # np.random.uniform generates random numbers between min and max
    # Adding noise makes the data look more like real sensor readings
    # Real sensors always have tiny random fluctuations

    data = {
        # Accelerometer values in m/s²
        # np.random.uniform(low, high, n) → generates n random numbers between low and high
        'accel_x': np.random.uniform(*accel_x_range, n) + np.random.normal(0, noise_level, n),
        'accel_y': np.random.uniform(*accel_y_range, n) + np.random.normal(0, noise_level, n),
        'accel_z': np.random.uniform(*accel_z_range, n) + np.random.normal(0, noise_level, n),

        # Gyroscope values in rad/s (radians per second)
        'gyro_x': np.random.uniform(*gyro_x_range, n) + np.random.normal(0, noise_level, n),
        'gyro_y': np.random.uniform(*gyro_y_range, n) + np.random.normal(0, noise_level, n),
        'gyro_z': np.random.uniform(*gyro_z_range, n) + np.random.normal(0, noise_level, n),

        # GPS speed in km/h
        'speed': np.random.uniform(*speed_range, n),

        # Label — what activity this sample represents
        'label': label,

        # Human readable label name (for understanding the data)
        'label_name': label_name,
    }

    return pd.DataFrame(data)


# ── CLASS 0: SITTING ──────────────────────────────────────
# When sitting:
# - Accelerometer: mostly still, gravity pulls z-axis to ~9.8 m/s²
#   (9.8 is the acceleration due to gravity on Earth)
# - Gyroscope: near zero — phone is not rotating
# - Speed: 0 km/h — not moving

print("📊 Generating SITTING data (label=0)...")

sitting = generate_samples(
    n=SAMPLES_PER_CLASS,
    label=0,
    label_name='sitting',
    accel_x_range=(-0.3, 0.3),    # very little left/right movement
    accel_y_range=(-0.3, 0.3),    # very little up/down movement
    accel_z_range=(9.5, 10.1),    # gravity on z axis ≈ 9.8 m/s²
    gyro_x_range=(-0.05, 0.05),   # barely rotating
    gyro_y_range=(-0.05, 0.05),
    gyro_z_range=(-0.05, 0.05),
    speed_range=(0, 1.0),         # stationary
    noise_level=0.03,             # low noise — sitting is stable
)
print(f"   ✅ {len(sitting)} sitting samples generated")


# ── CLASS 1: WALKING ──────────────────────────────────────
# When walking:
# - Accelerometer: rhythmic up/down bounce (y-axis), slight forward tilt
#   Walking creates a 1-2 Hz oscillation in the sensor data
# - Gyroscope: small rotations from arm swing and body movement
# - Speed: 3-7 km/h — typical walking speed

print("📊 Generating WALKING data (label=1)...")

walking = generate_samples(
    n=SAMPLES_PER_CLASS,
    label=1,
    label_name='walking',
    accel_x_range=(-1.5, 1.5),    # side to side arm swing
    accel_y_range=(-2.0, 2.0),    # up/down bounce from steps
    accel_z_range=(7.5, 11.5),    # gravity + walking movement
    gyro_x_range=(-0.8, 0.8),     # tilting from walking
    gyro_y_range=(-0.5, 0.5),     # turning slightly
    gyro_z_range=(-0.3, 0.3),     # rotating
    speed_range=(3.0, 7.0),       # typical walking: 3-7 km/h
    noise_level=0.15,             # more noise — walking is irregular
)
print(f"   ✅ {len(walking)} walking samples generated")


# ── CLASS 2: DRIVING ──────────────────────────────────────
# When driving:
# - Accelerometer: moderate values from road vibrations and turns
#   The phone is relatively stable in a car holder
# - Gyroscope: small rotations from road bumps and lane changes
# - Speed: 20-120 km/h — typical driving speed
# - Road vibration creates a characteristic pattern different from walking

print("📊 Generating DRIVING data (label=2)...")

driving = generate_samples(
    n=SAMPLES_PER_CLASS,
    label=2,
    label_name='driving',
    accel_x_range=(-3.0, 3.0),    # turns and lane changes
    accel_y_range=(-2.5, 2.5),    # road bumps
    accel_z_range=(8.5, 10.5),    # gravity + vibration
    gyro_x_range=(-1.2, 1.2),     # road bumps causing tilt
    gyro_y_range=(-0.8, 0.8),     # turning
    gyro_z_range=(-1.0, 1.0),     # lane changes
    speed_range=(20.0, 120.0),    # typical driving: 20-120 km/h
    noise_level=0.2,              # road vibration creates noise
)
print(f"   ✅ {len(driving)} driving samples generated")


# ── COMBINE ALL CLASSES ────────────────────────────────────
# pd.concat stacks all three DataFrames on top of each other
# ignore_index=True resets the row numbers from 0

print()
print("🔀 Combining all classes...")

all_data = pd.concat([sitting, walking, driving], ignore_index=True)

# Shuffle the data so classes are mixed up randomly
# If we don't shuffle, the model sees all sitting first, then all walking etc.
# Shuffled data helps the model learn better
all_data = all_data.sample(frac=1, random_state=42).reset_index(drop=True)

print(f"   Total samples: {len(all_data)}")


# ── ADD ENGINEERED FEATURES ────────────────────────────────
# Feature engineering = creating new columns from existing ones
# These help the model distinguish activities more easily

print()
print("⚙️  Engineering additional features...")

# Total acceleration magnitude — single number showing overall movement
# Formula: sqrt(x² + y² + z²) — Pythagorean theorem in 3D
all_data['accel_magnitude'] = np.sqrt(
    all_data['accel_x']**2 +
    all_data['accel_y']**2 +
    all_data['accel_z']**2
)

# Total gyroscope magnitude — overall rotation amount
all_data['gyro_magnitude'] = np.sqrt(
    all_data['gyro_x']**2 +
    all_data['gyro_y']**2 +
    all_data['gyro_z']**2
)

# Speed category — helps model use speed as a strong feature
# 0 = stationary, 1 = slow (walking), 2 = fast (driving)
all_data['speed_category'] = pd.cut(
    all_data['speed'],
    bins=[-1, 2, 15, 200],
    labels=[0, 1, 2]
).astype(int)

print("   ✅ accel_magnitude added")
print("   ✅ gyro_magnitude added")
print("   ✅ speed_category added")


# ── SAVE TO CSV ────────────────────────────────────────────
# CSV = Comma Separated Values — a simple spreadsheet format
# Each row = one sensor reading
# Each column = one feature

print()
print(f"💾 Saving to {OUTPUT_FILE}...")

all_data.to_csv(OUTPUT_FILE, index=False)

print(f"   ✅ Saved {len(all_data)} rows to {OUTPUT_FILE}")


# ── PRINT SUMMARY ──────────────────────────────────────────
print()
print("=" * 45)
print("📈 DATASET SUMMARY")
print("=" * 45)

# Show how many samples of each class we have
print("\nSamples per class:")
class_counts = all_data['label_name'].value_counts()
for name, count in class_counts.items():
    bar = "█" * (count // 10)
    print(f"  {name:10} : {count} samples  {bar}")

# Show the first 5 rows so we can see what the data looks like
print("\nFirst 5 rows of dataset:")
print(all_data[['accel_x', 'accel_y', 'accel_z', 'speed', 'label_name']].head())

# Show statistics for each column
print("\nDataset statistics:")
print(all_data.describe().round(3))

print()
print("=" * 45)
print("✅ Data collection complete!")
print(f"📁 File saved: backend/{OUTPUT_FILE}")
print("▶️  Next: Run train_model.py to train the ML model")
print("=" * 45)