#  SafeDrive — AI-Powered Distracted Driving Prevention App

> A cross-platform mobile application that uses Machine Learning, Computer Vision, and real-time sensor data to detect distracted driving and protect lives.

---

##  Overview

SafeDrive is a React Native mobile app (Android + iOS) that automatically detects when a user is driving using phone sensors and a trained ML model — then activates a suite of safety features including notification blocking, smart auto-replies, camera-based attention monitoring, and a gamified safety score system.

Built as a real-world AI/ML project combining a Python Flask backend with a React Native frontend.

---

##  Features

| Feature | Description |
|---|---|
|  AI Driving Detection | Uses accelerometer, gyroscope + GPS with a RandomForest ML model to classify activity as sitting / walking / driving |
|  Auto Drive Mode | Automatically triggers Drive Mode when speed > 15 km/h + ML confirms driving |
|  Smart Message Blocking | Blocks notifications from WhatsApp, Instagram etc. during Drive Mode |
|  Auto Reply | Sends automatic SMS reply: "I'm driving right now, will reply soon." |
|  Attention Monitoring | Uses front camera + MediaPipe/OpenCV to detect head tilt and eye focus — alerts user if distracted |
|  Gamification | Driving score system (+10 safe session, -20 phone use), session history, and leaderboard |

---

##  Tech Stack

**Frontend**
- React Native (Expo)
- expo-sensors (accelerometer, gyroscope)
- expo-location (GPS speed)
- expo-camera (attention monitoring)
- expo-notifications
- expo-av (audio alerts)
- React Navigation

**Backend**
- Python 3.10+
- Flask (REST API)
- Scikit-learn (RandomForest classifier)
- MediaPipe + OpenCV (computer vision)
- Pandas, NumPy
- Joblib (model serialization)

**Deployment**
- Backend: Render.com (free tier)
- Mobile: Expo EAS Build (APK for Android)

---

##  Project Structure

```
SafeDriveApp/
│
├── frontend/                  # React Native Expo app
│   ├── screens/
│   │   ├── HomeScreen.js      # Main dashboard + Drive Mode toggle
│   │   ├── ScoreScreen.js     # Driving score + session history
│   │   └── SettingsScreen.js  # Auto-reply, permissions config
│   ├── components/
│   ├── context/
│   │   └── DriveContext.js    # Global Drive Mode state
│   ├── App.js
│   └── app.json
│
├── backend/                   # Python Flask ML backend
│   ├── app.py                 # Main Flask API
│   ├── train_model.py         # ML model training script
│   ├── collect_data.py        # Sensor data collection + labeling
│   ├── attention.py           # OpenCV/MediaPipe attention detection
│   ├── model.pkl              # Trained RandomForest model
│   ├── dataset.csv            # Labeled sensor training data
│   └── requirements.txt
│
└── README.md
```

---

##  Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Expo Go app on your phone
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/Nishka2505/SafeDriveApp.git
cd SafeDriveApp
```

---

### 2. Run the Backend

```bash
cd backend
pip install -r requirements.txt
python train_model.py        # Train the ML model first
python app.py                # Start Flask server on port 5000
```

Backend will be live at: `http://localhost:5000`

**API Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/predict` | Send sensor data → returns activity label |
| POST | `/attention` | Send camera frame → returns distraction status |

---

### 3. Run the Mobile App

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your Android or iOS device.

>  Make sure your phone and computer are on the same WiFi network. Update the API base URL in the app to match your machine's local IP.

---

##  How the ML Model Works

1. Sensor data (accelerometer x/y/z, gyroscope x/y/z, GPS speed) is collected every 2 seconds
2. The app sends this as a JSON array to the `/predict` endpoint
3. A pre-trained **RandomForestClassifier** classifies the activity:
   - `0` → Sitting
   - `1` → Walking
   - `2` → Driving
4. If `driving` + GPS speed > 15 km/h → Drive Mode activates automatically

**Model performance:** ~94% accuracy on test split (80/20)

---

##  How Attention Monitoring Works

1. Front camera captures a frame every 1.5 seconds
2. Frame is encoded as base64 and sent to `/attention`
3. **MediaPipe FaceMesh** detects 468 facial landmarks
4. Head tilt angle + eye aspect ratio are calculated
5. If distracted → app plays a loud audio alert
6. If distracted 3+ times in a session → full-screen warning overlay

---

##  Scoring System

| Event | Points |
|---|---|
| Completed safe driving session | +10 |
| Phone used while driving detected | -20 |
| 5 safe sessions in a row | +25 bonus |

Scores are saved locally and displayed on a leaderboard screen.

---


##  Development Roadmap

| Day | Feature |
|---|---|
| Day 1 | Project setup + GitHub repo |
| Day 2 | Home screen UI |
| Day 3 | Accelerometer + Gyroscope data |
| Day 4 | GPS speed tracking |
| Day 5 | ML data collection script |
| Day 6 | Train driving detection model |
| Day 7 | Flask prediction API |
| Day 8 | Connect app to backend |
| Day 9 | Auto Drive Mode trigger |
| Day 10 | Message blocking + smart reply |
| Day 11 | Camera attention API (OpenCV) |
| Day 12 | Camera integration + alerts |
| Day 13 | Gamification + leaderboard |
| Day 14 | Polish + deploy + APK build |

---

##  Deployment

### Backend (Render.com)
1. Push backend folder to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python app.py`
5. Copy the live URL and update it in the React Native app

### Mobile App (Expo EAS)
```bash
npm install -g eas-cli
eas login
eas build --platform android
```


---

##  Author

**Nishka Gupta**  
B.Tech — Computer Science & Engineering (Data Science)  
Pranveer Singh Institute of Technology, Kanpur  
 nishkagupta80@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/nishka-gupta-7a9a76364/)

---

##  License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

> *Built to make roads safer using the power of AI and mobile technology.*