import express, { Request, Response } from 'express';
import UserModel from '../models/User';
import "../models/College"; // ✅ This registers the College model


const router = express.Router();

router.get("/dean", async (req: Request, res: Response): Promise<void> => {
  try {
    const deanList = await UserModel.find({ role: "dean" })
      .select("first_name middle_name last_name username email college status")
      .populate("college", "code name"); // 👈 This gets code & name from College

    res.json(deanList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
