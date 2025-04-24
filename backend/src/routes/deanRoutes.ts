import express, { Request, Response } from 'express';
import UserModel from '../models/User';
import "../models/User";


const router = express.Router();

// GET Program Chairpersons based on College Code from query
router.get("/programchairs", async (req: Request, res: Response): Promise<void> => {
    const { collegeCode } = req.query;
  
    if (!collegeCode) {
      res.status(400).json({ message: "collegeCode is missing" });
      return;
    }
  
    try {
      const programChairs = await UserModel.find({ role: { $in: ["programchairperson", "instructor"] } })
        .populate({
          path: "college",
          select: "code",
          match: { code: (collegeCode as string) },
        })
        .select("first_name middle_name last_name username email role status course college")
        .exec();
  
      const filteredChairs = programChairs.filter((user) => user.college);
  
      res.json(filteredChairs);
    } catch (error) {
      console.error("Error fetching program chairpersons:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

export default router;
