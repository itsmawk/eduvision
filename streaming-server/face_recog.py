import cv2
import numpy as np
import os
from flask import Flask, Response
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# MongoDB setup
client = MongoClient("mongodb+srv://saynoseanniel:mathematics10@cluster0.crfzw.mongodb.net/eduvision?retryWrites=true&w=majority")
db = client["eduvision"]
users_collection = db["users"]
schedules_collection = db["schedules"]
logs_collection = db["logs"]
sections_collection = db["sections"]

# Set current camera's lab location
CURRENT_ROOM = "Lab 1"

# Load trained model
recognizer = cv2.face.LBPHFaceRecognizer_create()
model_path = "streaming-server/trainer.yml"

if not os.path.exists(model_path):
    print("Error: No trained model found. Run 'train_faces.py' first.")
    exit()

recognizer.read(model_path)

# Load Haar Cascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

# Map label index to user last name
data_dir = "streaming-server/dataset"
folder_names = os.listdir(data_dir)

label_dict = {}
id_dict = {}

for label, folder_name in enumerate(folder_names):
    try:
        user = users_collection.find_one({"_id": ObjectId(folder_name)})
        last_name = user.get("last_name", "Unknown") if user else "Unknown"
        label_dict[label] = last_name
        id_dict[label] = folder_name
    except Exception as e:
        print(f"Error fetching user {folder_name}: {e}")
        label_dict[label] = "Unknown"
        id_dict[label] = None

# Track last seen timestamps
last_seen_times = {}

# Check if instructor is scheduled now and return schedule document
def get_current_schedule(user_id, room):
    now = datetime.now()
    current_day = now.strftime('%a').lower()[:3]
    current_time = now.strftime('%H:%M')
    current_date = now.strftime('%Y-%m-%d')

    query = {
        "instructor": ObjectId(user_id),
        "room": room,
        f"days.{current_day}": True,
        "semesterStartDate": {"$lte": current_date},
        "semesterEndDate": {"$gte": current_date},
        "startTime": {"$lte": current_time},
        "endTime": {"$gte": current_time}
    }

    return schedules_collection.find_one(query)

# Log attendance
def log_attendance(schedule_doc):
    now = datetime.now()
    today = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M")

    existing_log = logs_collection.find_one({
        "schedule": schedule_doc["_id"],
        "date": today,
        "status": {"$in": ["present", "late"]}
    })

    if existing_log:
        return  # Already logged

    start_time = schedule_doc["startTime"]
    is_late = current_time > start_time

    section_doc = sections_collection.find_one({"_id": schedule_doc["section"]})
    course = section_doc.get("course", "Unknown")
    college = section_doc.get("college")

    logs_collection.insert_one({
        "schedule": schedule_doc["_id"],
        "date": today,
        "status": "late" if is_late else "present",
        "timeIn": current_time,
        "remarks": "Present (Late)" if is_late else "Present (Not late)",
        "college": college,
        "course": course
    })

# Log left early
def log_left_early(schedule_doc):
    now = datetime.now()
    today = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M")

    section_doc = sections_collection.find_one({"_id": schedule_doc["section"]})
    course = section_doc.get("course", "Unknown")
    college = section_doc.get("college")

    logs_collection.insert_one({
        "schedule": schedule_doc["_id"],
        "date": today,
        "status": "Left early",
        "timeout": current_time,
        "remarks": "Detected but left lab early (no presence for 1 minute)",
        "college": college,
        "course": course
    })

# Log returned to lab
def log_returned_to_lab(schedule_doc):
    now = datetime.now()
    today = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M")

    section_doc = sections_collection.find_one({"_id": schedule_doc["section"]})
    course = section_doc.get("course", "Unknown")
    college = section_doc.get("college")

    logs_collection.insert_one({
        "schedule": schedule_doc["_id"],
        "date": today,
        "status": "Returned",
        "timeIn": current_time,
        "remarks": "Instructor returned in lab",
        "college": college,
        "course": course
    })

# Log schedule ended while instructor still in lab
def log_schedule_ended(schedule_doc):
    now = datetime.now()
    today = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M")

    existing_log = logs_collection.find_one({
        "schedule": schedule_doc["_id"],
        "date": today,
        "status": "Schedule Ended"
    })

    if existing_log:
        return  # Avoid duplicate

    section_doc = sections_collection.find_one({"_id": schedule_doc["section"]})
    course = section_doc.get("course", "Unknown")
    college = section_doc.get("college")

    logs_collection.insert_one({
        "schedule": schedule_doc["_id"],
        "date": today,
        "status": "Schedule Ended",
        "timeIn": current_time,
        "remarks": "Instructor schedule ended",
        "college": college,
        "course": course
    })



# Open webcam
cap = cv2.VideoCapture(0)

def generate_frames():
    global last_seen_times
    last_status_logged = {}  # user_id: ('left' or 'returned', timestamp)


    while True:
        success, frame = cap.read()
        if not success:
            break
        frame = cv2.flip(frame, 1)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5, minSize=(50, 50))

        now = datetime.now()
        top_right_message = ""

        recognized_user_ids = set()

        for (x, y, w, h) in faces:
            roi_gray = gray[y:y + h, x:x + w]
            label, confidence = recognizer.predict(roi_gray)

            if confidence > 70:
                continue  # Skip unknown

            user_id = id_dict.get(label)
            if not user_id:
                continue  # Skip unregistered

            recognized_user_ids.add(user_id)
            last_seen_times[user_id] = now  # Update last seen time

            last_name = label_dict.get(label, "Unknown")
            display_name = f"{last_name} ({int(confidence)}%)"

            schedule_doc = get_current_schedule(user_id, CURRENT_ROOM)
            is_scheduled = schedule_doc is not None
            color = (0, 255, 0) if is_scheduled else (0, 0, 255)
            last_seen_times[user_id] = now
            last_action = last_status_logged.get(user_id)

            if schedule_doc:
                today = now.strftime("%Y-%m-%d")
                already_logged = logs_collection.find_one({
                    "schedule": schedule_doc["_id"],
                    "date": today,
                    "status": {"$in": ["present", "late"]}
                })

                if not already_logged:
                    log_attendance(schedule_doc)
                    last_status_logged[user_id] = ("present", now)
                else:
                    # Only log "Returned" if they were marked "Left early"
                    was_left_early = logs_collection.find_one({
                        "schedule": schedule_doc["_id"],
                        "date": today,
                        "status": "Left early"
                    })

                    if was_left_early and (
                        not last_action or last_action[0] != "returned" or (now - last_action[1]).total_seconds() > 60
                    ):
                        log_returned_to_lab(schedule_doc)
                        last_status_logged[user_id] = ("returned", now)



            text_x = x
            text_y = y - 10 if y - 10 > 10 else y + h + 20
            cv2.putText(frame, display_name, (text_x, text_y),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)

        # Detect who may have left early
        for user_id, last_seen_time in list(last_seen_times.items()):
            if user_id not in recognized_user_ids:
                time_diff = now - last_seen_time
                if time_diff.total_seconds() > 60:
                    schedule_doc = get_current_schedule(user_id, CURRENT_ROOM)
                    if schedule_doc:
                        last_action = last_status_logged.get(user_id)
                        if not last_action or last_action[0] != "left" or (now - last_action[1]).total_seconds() > 60:
                            log_left_early(schedule_doc)
                            last_status_logged[user_id] = ("left", now)


        # Display messages
        if top_right_message:
            text_size, _ = cv2.getTextSize(top_right_message, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
            x_pos = frame.shape[1] - text_size[0] - 10
            y_pos = 60
            cv2.putText(frame, top_right_message, (x_pos, y_pos),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        lab_text_size, _ = cv2.getTextSize(CURRENT_ROOM, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
        x_lab = frame.shape[1] - lab_text_size[0] - 10
        y_lab = frame.shape[0] - 30
        cv2.putText(frame, CURRENT_ROOM, (x_lab, y_lab),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

        _, buffer = cv2.imencode(".jpg", frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route("/video_feed")
def video_feed():
    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
