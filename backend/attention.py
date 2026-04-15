import cv2
import numpy as np
import base64

# attention.py — Simplified distraction detection using OpenCV only
# Uses face detection + basic head position instead of MediaPipe

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)
eye_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_eye.xml'
)

def detect_attention(image_base64: str) -> dict:
    try:
        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return {
                'distracted': False,
                'reason': 'Could not decode image',
                'face_detected': False,
            }

        # Convert to grayscale for detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Detect faces
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(80, 80)
        )

        # No face detected
        if len(faces) == 0:
            return {
                'distracted': True,
                'reason': 'No face detected — looking away?',
                'face_detected': False,
                'ear_left': 0,
                'ear_right': 0,
                'avg_ear': 0,
                'head_tilt': 0,
            }

        # Get the largest face
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])

        # Check if face is centered (not looking away)
        image_height, image_width = image.shape[:2]
        face_center_x = x + w / 2
        face_center_y = y + h / 2

        # If face is too far from center → looking away
        x_offset = abs(face_center_x - image_width / 2) / (image_width / 2)
        y_offset = abs(face_center_y - image_height / 2) / (image_height / 2)

        distracted = False
        reason = 'Attentive'

        if x_offset > 0.5:
            distracted = True
            reason = 'Face not centered — looking sideways?'
        elif y_offset > 0.5:
            distracted = True
            reason = 'Head tilted too far down'
        else:
            # Check for eyes within the face region
            face_roi = gray[y:y+h, x:x+w]
            eyes = eye_cascade.detectMultiScale(
                face_roi,
                scaleFactor=1.1,
                minNeighbors=3,
                minSize=(20, 20)
            )

            # If no eyes detected within face → eyes might be closed
            if len(eyes) == 0:
                distracted = True
                reason = 'Eyes not detected — possibly closed'

        return {
            'distracted': distracted,
            'reason': reason,
            'face_detected': True,
            'face_position': {
                'x_offset': round(float(x_offset), 3),
                'y_offset': round(float(y_offset), 3),
            },
            'ear_left': 0.25,
            'ear_right': 0.25,
            'avg_ear': 0.25,
            'head_tilt': round(float(y_offset * 30), 1),
        }

    except Exception as e:
        return {
            'distracted': False,
            'reason': f'Error: {str(e)}',
            'face_detected': False,
            'ear_left': 0,
            'ear_right': 0,
            'avg_ear': 0,
            'head_tilt': 0,
        }