# DriveZen
SafeDrive is a React Native mobile app (Android + iOS) that automatically detects when a user is driving using phone sensors and a trained ML model — then activates a suite of safety features including notification blocking, smart auto-replies, camera-based attention monitoring, and a gamified safety score system.

Built as a real-world AI/ML project combining a Python Flask backend with a React Native frontend.

FRONTEND:
- React Native (Expo)
- expo-sensors (accelerometer, gyroscope)
- expo-location (GPS speed)
- expo-camera (attention monitoring)
- expo-notifications
- expo-av (audio alerts)
- React Navigation

BACKEND:
- Python 3.10+
- Flask (REST API)
- Scikit-learn (RandomForest classifier)
- MediaPipe + OpenCV (computer vision)
- Pandas, NumPy
  

