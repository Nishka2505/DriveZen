import requests
import json

# test_api.py — Tests all Flask API endpoints
#
# Run this in a SECOND PowerShell window while app.py is running
# in the first window.
#
# This simulates exactly what the phone app will send on Day 8.

BASE_URL = "http://localhost:5000"

print("🧪 SafeDrive API Tester")
print("=" * 45)
print(f"Testing: {BASE_URL}")
print()

# ── HELPER FUNCTION ────────────────────────────────────────
def test_endpoint(method, path, data=None, description=""):
    """Makes a request and prints the result nicely."""
    url = f"{BASE_URL}{path}"
    print(f"{'─' * 45}")
    print(f"  {method} {path}")
    if description:
        print(f"  📝 {description}")
    print()

    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        else:
            response = requests.post(url, json=data, timeout=5)

        # Pretty print the JSON response
        result = response.json()
        print(f"  Status: {response.status_code}")
        print(f"  Response:")
        for line in json.dumps(result, indent=4).split('\n'):
            print(f"    {line}")
        return result

    except requests.exceptions.ConnectionError:
        print("  ❌ CONNECTION REFUSED")
        print("  Make sure app.py is running in another terminal!")
        print("  Run: python app.py")
        return None
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None

print()

# ── TEST 1: HEALTH CHECK ───────────────────────────────────
test_endpoint("GET", "/",
    description="Basic health check")

print()

# ── TEST 2: STATUS ─────────────────────────────────────────
test_endpoint("GET", "/status",
    description="Detailed server status")

print()

# ── TEST 3: PREDICT SITTING ────────────────────────────────
result = test_endpoint("POST", "/predict",
    data={
        "accel_x": 0.05,
        "accel_y": 0.02,
        "accel_z": 9.81,
        "gyro_x": 0.01,
        "gyro_y": 0.00,
        "gyro_z": 0.01,
        "speed": 0.0
    },
    description="Should predict: SITTING"
)

if result:
    activity = result.get('activity', 'unknown')
    confidence = result.get('confidence', 0) * 100
    expected = "sitting"
    status = "✅" if activity == expected else "❌"
    print(f"\n  {status} Expected: {expected} | Got: {activity} ({confidence:.1f}%)")

print()

# ── TEST 4: PREDICT WALKING ────────────────────────────────
result = test_endpoint("POST", "/predict",
    data={
        "accel_x": 1.1,
        "accel_y": 1.7,
        "accel_z": 9.3,
        "gyro_x": 0.4,
        "gyro_y": 0.3,
        "gyro_z": 0.2,
        "speed": 4.5
    },
    description="Should predict: WALKING"
)

if result:
    activity = result.get('activity', 'unknown')
    confidence = result.get('confidence', 0) * 100
    expected = "walking"
    status = "✅" if activity == expected else "❌"
    print(f"\n  {status} Expected: {expected} | Got: {activity} ({confidence:.1f}%)")

print()

# ── TEST 5: PREDICT DRIVING ────────────────────────────────
result = test_endpoint("POST", "/predict",
    data={
        "accel_x": 2.1,
        "accel_y": 1.5,
        "accel_z": 9.6,
        "gyro_x": 0.8,
        "gyro_y": 0.6,
        "gyro_z": 0.9,
        "speed": 65.0
    },
    description="Should predict: DRIVING"
)

if result:
    activity = result.get('activity', 'unknown')
    confidence = result.get('confidence', 0) * 100
    is_driving = result.get('is_driving', False)
    expected = "driving"
    status = "✅" if activity == expected else "❌"
    print(f"\n  {status} Expected: {expected} | Got: {activity} ({confidence:.1f}%)")
    print(f"  is_driving flag: {is_driving}")

print()

# ── TEST 6: MISSING FIELDS ERROR ──────────────────────────
test_endpoint("POST", "/predict",
    data={"accel_x": 1.0},
    description="Should return error: missing fields"
)

print()

# ── TEST 7: HISTORY ────────────────────────────────────────
test_endpoint("GET", "/history",
    description="Last 10 predictions"
)

print()
print("=" * 45)
print("✅ API testing complete!")
print("▶️  Next: Day 8 — Connect phone app to this API")
print("=" * 45)