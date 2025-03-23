import cv2
import os

name = input("Enter person's name: ")
person_dir = f"streaming-server/dataset/{name}"

if not os.path.exists(person_dir):
    os.makedirs(person_dir)

cap = cv2.VideoCapture(0)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

count = 0
while count < 20:  # Capture 20 images
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5)

    for (x, y, w, h) in faces:
        face_img = gray[y:y+h, x:x+w]
        img_path = os.path.join(person_dir, f"{count}.jpg")
        cv2.imwrite(img_path, face_img)
        count += 1
        print(f"Saved: {img_path}")

    cv2.imshow("Capturing Faces", frame)
    if cv2.waitKey(1) & 0xFF == ord('q') or count >= 20:
        break

cap.release()
cv2.destroyAllWindows()
print(f"Face data collection complete. {count} images saved in {person_dir}.")
