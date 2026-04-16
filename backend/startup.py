import os

# startup.py — Runs once when the server starts on Render.com
# Trains the ML model if model.pkl doesn't exist yet
# This is needed because we don't push model.pkl to GitHub
# (it's in .gitignore — too large)

print("🚀 DriveZen startup check...")

if not os.path.exists('model.pkl'):
    print("⚠️  model.pkl not found — training now...")
    print("   This happens once on first deploy")

    try:
        # Run data collection
        exec(open('collect_data.py').read())
        print("✅ Dataset generated")

        # Run model training
        exec(open('train_model.py').read())
        print("✅ Model trained and saved")

    except Exception as e:
        print(f"❌ Training failed: {e}")
        print("   Server will start without ML model")
else:
    print("✅ model.pkl found — ready to serve predictions")

print("🟢 Startup complete")