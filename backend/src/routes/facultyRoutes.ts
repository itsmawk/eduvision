import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Faculty from "../models/Faculty";
import Schedule from "../models/Schedule";
import dotenv from "dotenv";
import mongoose from "mongoose";


dotenv.config();
const router = express.Router();

// UPDATE CREDENTIALS ROUTE
router.put("/update-credentials/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    const faculty = await Faculty.findById(id);
    if (!faculty) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const existingUser = await Faculty.findOne({ username, _id: { $ne: id } });
    if (existingUser) {
      res.status(400).json({ message: "Username is already taken" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    faculty.username = username;
    faculty.password = hashedPassword;
    faculty.status = "permanent";

    await faculty.save();

    res.json({ message: "Credentials updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET SCHEDULES FOR SPECIFIC FACULTY
router.get("/faculty-schedules/:facultyId", async (req: Request, res: Response): Promise<void> => {
    try {
      const { facultyId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(facultyId)) {
        res.status(400).json({ message: "Invalid faculty ID" });
        return;
      }
  
      const schedules = await Schedule.find({ instructor: facultyId }).populate("section instructor");
  
      res.json(schedules);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching faculty schedules" });
    }
  });
  

export default router;