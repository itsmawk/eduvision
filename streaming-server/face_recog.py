import cv2
import numpy as np
import os
from flask import Flask, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Load trained model
recognizer = cv2.face.LBPHFaceRecognizer_create()
model_path = "streaming-server/trainer.yml"

if not os.path.exists(model_path):
    print("Error: No trained model found. Run 'train_faces.py' first.")
    exit()

recognizer.read(model_path)

# Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

# Load label-to-name mapping
data_dir = "streaming-server/dataset"
label_dict = {label: name for label, name in enumerate(os.listdir(data_dir))}

# Open webcam (Change 0 to a URL for CCTV)
cap = cv2.VideoCapture(0)

def generate_frames():
    while True:
        success, frame = cap.read()
        if not success:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5, minSize=(50, 50))

        for (x, y, w, h) in faces:
            roi_gray = gray[y:y + h, x:x + w]
            label, confidence = recognizer.predict(roi_gray)
            name = "Unknown" if confidence > 50 else label_dict.get(label, "Unknown")

            # Draw rectangle & label
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(frame, f"{name} ({int(confidence)}%)", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # Encode frame as JPEG
        _, buffer = cv2.imencode(".jpg", frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route("/video_feed")
def video_feed():
    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
