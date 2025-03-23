import cv2
import numpy as np
import os

# Initialize LBPH face recognizer
recognizer = cv2.face.LBPHFaceRecognizer_create()
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

# Dataset path
data_dir = "streaming-server/dataset"

if not os.path.exists(data_dir):
    print(f"❌ Dataset folder '{data_dir}' not found! Add images and try again.")
    exit()

labels = []
faces = []
label_dict = {}  # Mapping between labels and names

# Load images and prepare training data
label_counter = 0
for name in os.listdir(data_dir):
    person_path = os.path.join(data_dir, name)

    if not os.path.isdir(person_path):  # Skip non-folder files
        continue

    label_dict[label_counter] = name  # Assign label (ID) to the person's name

    for img_name in os.listdir(person_path):
        img_path = os.path.join(person_path, img_name)

        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            print(f"⚠ Skipping invalid image: {img_path}")
            continue

        faces.append(img)
        labels.append(label_counter)

    label_counter += 1

# Check if any data was collected
if len(faces) == 0:
    print("❌ No faces found in dataset! Add images to 'streaming-server/dataset/' and try again.")
    exit()

# Train the recognizer
recognizer.train(faces, np.array(labels))
trainer_path = "streaming-server/trainer.yml"
recognizer.write(trainer_path)  # Save the trained model

print(f"✅ Training complete! Model saved as '{trainer_path}'")
print(f"📌 Total faces trained: {len(faces)}")
print(f"📌 Recognized labels: {label_dict}")
