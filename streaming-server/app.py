from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import face_recognition
import numpy as np
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

known_faces = []

# Load known faces on startup
folder = "faces"
for filename in os.listdir(folder):
    if filename.lower().endswith((".jpg", ".png")):
        name = os.path.splitext(filename)[0].split("_")[0]
        img_path = os.path.join(folder, filename)
        image = face_recognition.load_image_file(img_path)
        encodings = face_recognition.face_encodings(image)
        if encodings:
            known_faces.append((name, encodings[0]))

@app.post("/recognize")
async def recognize_face(file: UploadFile = File(...)):
    try:
        image = np.frombuffer(await file.read(), np.uint8)
        img = face_recognition.load_image_file(image)
        encodings = face_recognition.face_encodings(img)

        if not encodings:
            raise HTTPException(status_code=400, detail="No faces found.")

        # Check each encoding against known faces
        matches = []
        for encoding in encodings:
            for name, known_encoding in known_faces:
                distance = np.linalg.norm(known_encoding - encoding)
                if distance < 0.6:
                    matches.append(name)

        return {"matches": matches if matches else ["Unknown"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)