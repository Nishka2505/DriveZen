import pandas as pd
import numpy as np

# visualize_data.py — Shows what the dataset looks like
# Run this AFTER collect_data.py to understand your data
#
# Good data understanding = better ML model
# Before training any model, always explore your data first!

print("📊 SafeDrive Dataset Visualizer")
print("=" * 45)

# ── LOAD THE DATASET ───────────────────────────────────────
try:
    df = pd.read_csv('dataset.csv')
    print(f"✅ Loaded dataset.csv — {len(df)} rows, {len(df.columns)} columns")
except FileNotFoundError:
    print("❌ dataset.csv not found!")
    print("   Run collect_data.py first: python collect_data.py")
    exit()

print()

# ── BASIC INFO ─────────────────────────────────────────────
print("📋 COLUMNS IN DATASET:")
for col in df.columns:
    print(f"   • {col} ({df[col].dtype})")

print()

# ── CLASS BALANCE ──────────────────────────────────────────
# Class balance means: do we have equal amounts of each activity?
# Imbalanced data (e.g. 900 sitting, 50 driving) leads to biased models
# Our dataset is perfectly balanced — 500 each

print("⚖️  CLASS BALANCE:")
counts = df['label_name'].value_counts()
total = len(df)
for name, count in counts.items():
    pct = (count / total) * 100
    bar = "█" * int(pct / 2)
    print(f"   {name:10} : {count:4} samples ({pct:.1f}%)  {bar}")

print()

# ── FEATURE RANGES PER CLASS ───────────────────────────────
# This shows what values each activity typically produces
# This is exactly what the ML model will learn!

print("📐 AVERAGE FEATURE VALUES PER CLASS:")
print()

features = ['accel_x', 'accel_y', 'accel_z',
            'gyro_x', 'gyro_y', 'gyro_z',
            'speed', 'accel_magnitude', 'gyro_magnitude']

group = df.groupby('label_name')[features].mean().round(3)
print(group.to_string())

print()

# ── KEY PATTERNS EXPLANATION ───────────────────────────────
print("🔍 KEY PATTERNS THE ML MODEL WILL LEARN:")
print()

sitting_speed = df[df['label_name'] == 'sitting']['speed'].mean()
walking_speed = df[df['label_name'] == 'walking']['speed'].mean()
driving_speed = df[df['label_name'] == 'driving']['speed'].mean()

sitting_mag = df[df['label_name'] == 'sitting']['accel_magnitude'].mean()
walking_mag = df[df['label_name'] == 'walking']['accel_magnitude'].mean()
driving_mag = df[df['label_name'] == 'driving']['accel_magnitude'].mean()

print(f"  Speed averages:")
print(f"    Sitting  → {sitting_speed:.1f} km/h  (stationary)")
print(f"    Walking  → {walking_speed:.1f} km/h  (slow movement)")
print(f"    Driving  → {driving_speed:.1f} km/h  (vehicle speed)")
print()
print(f"  Acceleration magnitude averages:")
print(f"    Sitting  → {sitting_mag:.2f} m/s²  (gravity only)")
print(f"    Walking  → {walking_mag:.2f} m/s²  (bouncing motion)")
print(f"    Driving  → {driving_mag:.2f} m/s²  (road vibrations)")

print()

# ── SAMPLE ROWS ────────────────────────────────────────────
print("👀 SAMPLE ROWS FROM EACH CLASS:")
print()

for label in ['sitting', 'walking', 'driving']:
    sample = df[df['label_name'] == label].head(2)
    print(f"  {label.upper()}:")
    print(sample[['accel_x', 'accel_y', 'accel_z',
                   'speed', 'accel_magnitude', 'label']].to_string(index=False))
    print()

# ── MISSING VALUES CHECK ───────────────────────────────────
print("🔎 MISSING VALUES CHECK:")
missing = df.isnull().sum()
if missing.sum() == 0:
    print("   ✅ No missing values — dataset is clean!")
else:
    print(f"   ⚠️  Found missing values:")
    print(missing[missing > 0])

print()
print("=" * 45)
print("✅ Data visualization complete!")
print("▶️  Next: Run train_model.py to train the model")
print("=" * 45)