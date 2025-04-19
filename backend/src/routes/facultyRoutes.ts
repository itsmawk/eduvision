import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
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

    const faculty = await User.findById(id);
    if (!faculty) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const existingUser = await User.findOne({ username, _id: { $ne: id } });
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
  
  // GET NEXT SUBJECT
  router.get("/next-schedule/:facultyId", async (req: Request, res: Response): Promise<void> => {
    const { facultyId } = req.params;
  
    try {
      if (!mongoose.Types.ObjectId.isValid(facultyId)) {
        res.status(400).json({ message: "Invalid faculty ID" });
        return;
      }
  
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const currentDateOnly = now.toISOString().slice(0, 10);
      const currentDate = new Date(currentDateOnly);
  
      const dayOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][now.getDay()];
  
      const allSchedules = await Schedule.find({
        instructor: facultyId,
        [`days.${dayOfWeek}`]: true,
      }).sort({ startTime: 1 });
  
      // Filter based on time and semester range
      const upcomingToday = allSchedules.find((schedule) => {
        const startTime = schedule.startTime;
        const semesterStart = new Date(schedule.semesterStartDate);
        const semesterEnd = new Date(schedule.semesterEndDate);
  
        return (
          semesterStart <= currentDate &&
          semesterEnd >= currentDate &&
          startTime > currentTime
        );
      });
  
      if (!upcomingToday) {
        res.status(404).json({ message: "No upcoming schedule today" });
        return;
      }
  
      res.json(upcomingToday);
    } catch (error) {
      console.error("Error getting next schedule:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  router.get("/schedules/today/:instructorId", async (req: Request, res: Response): Promise<void> => {
    const { instructorId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(instructorId)) {
            res.status(400).json({ message: "Invalid instructor ID" });
            return;
        }

        const now = new Date();
        const dayOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][now.getDay()];
        const currentDateOnly = now.toISOString().slice(0, 10);
        const currentDate = new Date(currentDateOnly);

        const schedules = await Schedule.find({
            instructor: instructorId,
            [`days.${dayOfWeek}`]: true,
            semesterStartDate: { $lte: currentDate.toISOString() }, 
            semesterEndDate: { $gte: currentDate.toISOString() }  
        })
        .select("startTime endTime room")

        if (!schedules.length) {
            res.status(404).json({ message: "No schedules found for today" });
            return;
        }

        res.status(200).json(schedules);
    } catch (error) {
        console.error("Error fetching instructor schedules:", error);
        res.status(500).json({ message: "Server error" });
    }
});


  

export default router;