from pymongo import MongoClient
import gridfs
import os

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "face_recognition"
COLLECTION_NAME = "faces"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
fs = gridfs.GridFS(db)

def fetch_known_faces():
    known_faces = []
    known_names = []

    for file in db[COLLECTION_NAME].find():
        name = file["name"]
        image_data = fs.get(file["file_id"]).read()

        # Save to a temp file to use with face_recognition
        temp_file = f"temp/{file['_id']}.jpg"
        os.makedirs("temp", exist_ok=True)
        with open(temp_file, "wb") as f:
            f.write(image_data)

        # Load the face encoding
        import face_recognition
        image = face_recognition.load_image_file(temp_file)
        encodings = face_recognition.face_encodings(image)
        
        if encodings:
            known_faces.append(encodings[0])
            known_names.append(name)

    return known_names, known_faces
