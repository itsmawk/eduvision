// src/api/faceRecognition.ts
import axios from "axios";

export const recognizeFace = async (file: File): Promise<string[]> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("http://localhost:8001/recognize", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data.matches;
};
