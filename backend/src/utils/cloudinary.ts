import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

// Set up Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    return {
      folder: "eduvision/profile-photos",
      allowed_formats: ["jpg", "jpeg", "png"],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`
    };
  }
});


const upload = multer({ storage });

export { upload, cloudinary };
