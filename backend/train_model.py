import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)
from sklearn.preprocessing import StandardScaler
from config import FEATURE_COLUMNS, LABELS, LABEL_NAMES, MODEL_FILE, DATASET_FILE

# train_model.py — Trains the driving detection ML model
#
# What is a Random Forest?
# Imagine asking 100 different people to guess your activity
# based on your phone sensor data. Each person uses slightly
# different rules. The final answer is whatever MOST people guess.
# That's a Random Forest — 100 "decision trees" voting together.
#
# Why Random Forest?
# ✅ Works great with sensor data
# ✅ Hard to overfit (memorize training data)
# ✅ Fast to train and predict
# ✅ Tells you which features matter most
# ✅ Doesn't need data scaling (unlike neural networks)
#
# Steps today:
# 1. Load dataset.csv
# 2. Split into training set (80%) and test set (20%)
# 3. Train RandomForestClassifier
# 4. Evaluate accuracy on the test set
# 5. Save the trained model as model.pkl

print("🤖 SafeDrive ML Model Training")
print("=" * 45)
print()

# ── STEP 1: LOAD DATA ─────────────────────────────────────
print("📂 Step 1: Loading dataset...")

try:
    df = pd.read_csv(DATASET_FILE)
    print(f"   ✅ Loaded {len(df)} samples from {DATASET_FILE}")
except FileNotFoundError:
    print(f"   ❌ {DATASET_FILE} not found!")
    print("   Run collect_data.py first: python collect_data.py")
    exit()

# Show class distribution
print()
print("   Class distribution:")
for label_id, label_name in LABELS.items():
    count = len(df[df['label'] == label_id])
    print(f"     {label_id} = {label_name:10} → {count} samples")

print()

# ── STEP 2: PREPARE FEATURES AND LABELS ───────────────────
print("⚙️  Step 2: Preparing features and labels...")

# X = features (input) — the sensor readings
# y = labels (output) — what activity it is
#
# Think of X as the question and y as the answer.
# The model learns to go from question → answer.

X = df[FEATURE_COLUMNS]  # All feature columns
y = df['label']           # The label column (0, 1, or 2)

print(f"   ✅ Features (X): {X.shape[0]} samples × {X.shape[1]} features")
print(f"   ✅ Labels   (y): {y.shape[0]} labels")
print(f"   Feature columns: {list(X.columns)}")
print()

# ── STEP 3: SPLIT INTO TRAIN AND TEST SETS ────────────────
print("✂️  Step 3: Splitting data into train/test sets...")

# Why split?
# We train on 80% of data and test on the remaining 20%.
# Testing on data the model has NEVER seen gives honest accuracy.
# If we tested on training data, the model could just memorize answers.
#
# test_size=0.2    → 20% for testing, 80% for training
# random_state=42  → makes the split reproducible every time
# stratify=y       → ensures equal class ratios in both sets

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y   # keeps class ratios equal in train and test
)

print(f"   ✅ Training set: {len(X_train)} samples")
print(f"   ✅ Test set:     {len(X_test)} samples")
print()

# ── STEP 4: TRAIN THE MODEL ───────────────────────────────
print("🌲 Step 4: Training RandomForest model...")
print("   (Training 100 decision trees...)")

# RandomForestClassifier parameters explained:
#
# n_estimators=100   → build 100 decision trees
# max_depth=15       → each tree can make up to 15 decisions deep
# min_samples_split=5 → a branch needs 5+ samples to split further
# min_samples_leaf=2  → each leaf must have 2+ samples
# class_weight='balanced' → treats all classes equally even if unbalanced
# random_state=42    → makes results reproducible
# n_jobs=-1          → use all CPU cores for faster training

model = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1,
)

# .fit() is the actual training step
# It shows the model every row in X_train and its correct label in y_train
# The model adjusts its internal rules to predict correctly
model.fit(X_train, y_train)

print("   ✅ Training complete!")
print()

# ── STEP 5: EVALUATE THE MODEL ────────────────────────────
print("📊 Step 5: Evaluating model performance...")
print()

# Predict on the test set
# These are samples the model has NEVER seen during training
y_pred = model.predict(X_test)

# Overall accuracy — what % of predictions were correct
accuracy = accuracy_score(y_test, y_pred)
print(f"   🎯 Overall Accuracy: {accuracy * 100:.2f}%")
print()

# Cross-validation — trains and tests on 5 different splits
# Gives a more reliable accuracy estimate
# cv=5 means split data 5 ways and test each split
cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
print(f"   📈 Cross-validation scores: {[f'{s:.3f}' for s in cv_scores]}")
print(f"   📈 Mean CV accuracy: {cv_scores.mean() * 100:.2f}% "
      f"(±{cv_scores.std() * 100:.2f}%)")
print()

# Classification report — accuracy per class
# Precision = of all times model said "driving", how often was it right?
# Recall    = of all actual "driving" samples, how many did model catch?
# F1-score  = balance between precision and recall

print("   📋 Classification Report:")
print()
report = classification_report(
    y_test, y_pred,
    target_names=LABEL_NAMES,
    digits=3
)
# Indent the report for nicer printing
for line in report.split('\n'):
    print(f"      {line}")

# Confusion Matrix
# Shows exactly which classes get confused with each other
# Rows = actual class, Columns = predicted class
# Diagonal = correct predictions
# Off-diagonal = mistakes

print()
print("   🔢 Confusion Matrix:")
print("      (rows=actual, cols=predicted)")
print()
cm = confusion_matrix(y_test, y_pred)
print(f"      {'':12}", end="")
for name in LABEL_NAMES:
    print(f"{name:12}", end="")
print()
for i, row in enumerate(cm):
    print(f"      {LABEL_NAMES[i]:12}", end="")
    for val in row:
        print(f"{val:12}", end="")
    print()

print()

# ── STEP 6: FEATURE IMPORTANCE ────────────────────────────
print("🏆 Step 6: Feature importance (which sensors matter most)...")
print()

# feature_importances_ tells us how much each feature
# contributed to the model's decisions
# Higher = more important for classification

importances = model.feature_importances_
feature_importance_df = pd.DataFrame({
    'feature': FEATURE_COLUMNS,
    'importance': importances
}).sort_values('importance', ascending=False)

for _, row in feature_importance_df.iterrows():
    bar_length = int(row['importance'] * 50)
    bar = "█" * bar_length
    print(f"   {row['feature']:20} {row['importance']:.4f}  {bar}")

print()

# ── STEP 7: TEST A SINGLE PREDICTION ─────────────────────
print("🧪 Step 7: Testing single predictions...")
print()

def predict_activity(accel_x, accel_y, accel_z,
                     gyro_x, gyro_y, gyro_z, speed):
    """
    Makes a single prediction given raw sensor values.
    This is exactly what the Flask API will do on Day 7!
    """
    # Calculate engineered features
    accel_magnitude = np.sqrt(accel_x**2 + accel_y**2 + accel_z**2)
    gyro_magnitude = np.sqrt(gyro_x**2 + gyro_y**2 + gyro_z**2)

    if speed < 2:
        speed_category = 0
    elif speed < 15:
        speed_category = 1
    else:
        speed_category = 2

    # Create a single-row DataFrame with the same columns as training
    sample = pd.DataFrame([{
        'accel_x': accel_x,
        'accel_y': accel_y,
        'accel_z': accel_z,
        'gyro_x': gyro_x,
        'gyro_y': gyro_y,
        'gyro_z': gyro_z,
        'speed': speed,
        'accel_magnitude': accel_magnitude,
        'gyro_magnitude': gyro_magnitude,
        'speed_category': speed_category,
    }])

    # predict() returns the class number (0, 1, or 2)
    prediction = model.predict(sample)[0]

    # predict_proba() returns confidence % for each class
    # e.g. [0.05, 0.10, 0.85] means 85% confident it's driving
    probabilities = model.predict_proba(sample)[0]
    confidence = probabilities[prediction]

    return LABELS[prediction], confidence, probabilities


# Test with sitting-like values
activity, conf, probs = predict_activity(
    accel_x=0.1, accel_y=0.05, accel_z=9.8,
    gyro_x=0.01, gyro_y=0.02, gyro_z=0.01,
    speed=0.0
)
print(f"   📱 Sitting scenario:  → {activity:10} ({conf*100:.1f}% confident)")

# Test with walking-like values
activity, conf, probs = predict_activity(
    accel_x=1.2, accel_y=1.8, accel_z=9.2,
    gyro_x=0.5, gyro_y=0.3, gyro_z=0.2,
    speed=5.0
)
print(f"   🚶 Walking scenario:  → {activity:10} ({conf*100:.1f}% confident)")

# Test with driving-like values
activity, conf, probs = predict_activity(
    accel_x=2.1, accel_y=1.5, accel_z=9.6,
    gyro_x=0.8, gyro_y=0.6, gyro_z=0.9,
    speed=65.0
)
print(f"   🚗 Driving scenario:  → {activity:10} ({conf*100:.1f}% confident)")

print()

# ── STEP 8: SAVE THE MODEL ────────────────────────────────
print("💾 Step 8: Saving trained model...")

# joblib.dump saves the entire trained model to a file
# joblib is better than pickle for large numpy arrays (like ML models)
# compress=3 reduces file size significantly

joblib.dump(model, MODEL_FILE, compress=3)

import os
file_size = os.path.getsize(MODEL_FILE) / 1024  # size in KB
print(f"   ✅ Model saved to {MODEL_FILE} ({file_size:.1f} KB)")

print()
print("=" * 45)
print("✅ MODEL TRAINING COMPLETE!")
print(f"   Accuracy: {accuracy * 100:.2f}%")
print(f"   Model file: {MODEL_FILE}")
print("   Ready for Day 7 — Flask API!")
print("=" * 45)