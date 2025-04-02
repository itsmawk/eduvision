import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Faculty from "../models/Faculty";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// LOGIN ROUTE
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const faculty = await Faculty.findOne({ username });
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
        id: faculty._id,
        role: faculty.role,
        first_name: faculty.first_name,
        middle_name: faculty.middle_name,
        last_name: faculty.last_name,
        status: faculty.status,
      },
      requiresUpdate: faculty.status === "temporary",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

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

// GET FACULTY LIST
router.get("/faculty", async (req: Request, res: Response): Promise<void> => {
  try {
    const facultyList = await Faculty.find().select("first_name middle_name last_name username email role status");
    res.json(facultyList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE FACULTY ACCOUNT
router.delete("/faculty/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findById(id);
    if (!faculty) {
      res.status(404).json({ message: "Faculty not found" });
      return;
    }

    await Faculty.findByIdAndDelete(id);
    res.json({ message: "Faculty account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE NEW FACULTY ACCOUNT
router.post("/faculty", async (req: Request, res: Response): Promise<void> => {
  console.log(req.body);
  try {
    const { last_name, first_name, middle_name, email, username, password, role } = req.body;

    if (!last_name || !first_name || !username || !email || !password || !role) {
      res.status(400).json({ message: "Please provide all required fields, including role" });
      return;
    }

    const validRoles = ["admin", "instructor"];
    if (!validRoles.includes(role)) {
      res.status(400).json({ message: "Invalid role. Role must be 'Admin' or 'Instructor'." });
      return;
    }

    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const existingFacultyUsername = await Faculty.findOne({ username });
    if (existingFacultyUsername) {
      res.status(400).json({ message: "Username already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newFaculty = new Faculty({
      last_name,
      first_name,
      middle_name: middle_name || "",
      username,
      email,
      password: hashedPassword,
      role,
      status: "temporary",
    });

    await newFaculty.save();

    res.status(201).json({
      _id: newFaculty._id,
      last_name: newFaculty.last_name,
      first_name: newFaculty.first_name,
      middle_name: newFaculty.middle_name,
      username: newFaculty.username,
      email: newFaculty.email,
      role: newFaculty.role,
      status: newFaculty.status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
