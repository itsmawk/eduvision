import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Faculty from "../models/Faculty";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, faculty.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: faculty._id, role: faculty.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      faculty: {
        id: faculty._id, // Ensure _id is included
        role: faculty.role,
        first_name: faculty.first_name,
        middle_name: faculty.middle_name,
        last_name: faculty.last_name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/faculty", async (req: Request, res: Response): Promise<void> => {
  try {
    const facultyList = await Faculty.find().select("first_name middle_name last_name email role");
    res.json(facultyList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;
