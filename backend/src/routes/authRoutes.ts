import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/User";
import Schedule from "../models/Schedule";
import Subject from "../models/Subject";
import Room from "../models/Room";
import Section from "../models/Section";
import CollegeModel from "../models/College";
import Log from "../models/AttendanceLogs";
import dotenv from "dotenv";
import multer from "multer";
import mammoth from "mammoth";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { ILog } from "../models/AttendanceLogs";
import nodemailer from "nodemailer";


dotenv.config();
const router = express.Router();
const upload = multer({ dest: "uploads/" });


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


router.post("/generate-daily-report", async (req: Request, res: Response) => {
  try {
    const { CourseName } = req.body;

    const query: any = {};
    if (CourseName) query.course = CourseName;

    const logs = await Log.find(query)
      .populate({ path: "schedule", populate: { path: "instructor" } })
      .populate("college")
      .lean();

    const tableData = logs.map((log) => {
      const schedule: any = log.schedule || {};
      const instructor = schedule?.instructor
        ? `${schedule.instructor.first_name} ${schedule.instructor.last_name}`
        : "N/A";
    
      return {
        instructorName: instructor,
        courseCode: schedule.courseCode || "N/A",
        courseTitle: schedule.courseTitle || "N/A",
        status: log.status || "N/A",
        timeInOut: `${log.timeIn || "-"} / ${log.timeout || "-"}`,
        room: schedule.room || "N/A",
      };
    });
    

    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const templatePath = path.join(__dirname, "../../templates/DailyReports.docx");
    const content = fs.readFileSync(templatePath, "binary");

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const formattedRows = tableData.map(entry =>
      `${entry.instructorName} | ${entry.courseCode} | ${entry.courseTitle} | ${entry.status} | ${entry.timeInOut} | ${entry.room}`
    );

    doc.setData({
      reportDate: today,
      courseName: CourseName?.toUpperCase() || "",
      logs: tableData,
    });
    

    doc.render();

    const buffer = doc.getZip().generate({ type: "nodebuffer" });

    const outputDir = path.join(__dirname, "../generated");
    const outputPath = path.join(outputDir, "DailyAttendanceReport.docx");

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(outputPath, buffer);

    res.download(outputPath, "DailyAttendanceReport.docx");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error generating report:", error.stack);
    } else {
      console.error("Unknown error occurred:", error);
    }
    res.status(500).json({ message: "Error generating report" });
  }
});


router.post("/show-daily-report", async (req: Request, res: Response) => {
  try {
    const { CourseName } = req.body;

    const query: any = {};
    if (CourseName) query.course = CourseName;

    const logs = await Log.find(query)
      .populate({ path: "schedule", populate: { path: "instructor" } })
      .populate("college")
      .lean();

    const tableData = logs.map((log) => {
      const schedule: any = log.schedule || {};
      const instructor = schedule?.instructor
        ? `${schedule.instructor.first_name} ${schedule.instructor.last_name}`
        : "N/A";

      return {
        name: instructor,
        courseCode: schedule.courseCode || "N/A",
        courseTitle: schedule.courseTitle || "N/A",
        status: log.status || "N/A",
        timeInOut: `${log.timeIn || "-"} / ${log.timeout || "-"}`,
        room: schedule.room || "N/A",
      };
    });

    res.status(200).json({ success: true, data: tableData });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching attendance data:", error.stack);
    } else {
      console.error("Unknown error occurred:", error);
    }
    res.status(500).json({ success: false, message: "Error fetching attendance data" });
  }
});


// FETCH ALL FULL SCHEDULES TODAY BASED ON COURSE
router.post("/all-schedules/today", async (req: Request, res: Response): Promise<void> => {
  const { shortCourseName } = req.body;

  if (!shortCourseName) {
    res.status(400).json({ message: "shortCourseName is missing" });
    return;
  }

  try {
    const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const today = dayNames[new Date().getDay()];

    const schedules = await Schedule.find({
      courseCode: { $regex: `^${shortCourseName}`, $options: "i" },
      [`days.${today}`]: true
    })
    .populate("instructor", "first_name last_name")
    .populate("section", "sectionName") 
    .lean();

    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ message: "Error fetching schedules" });
  }
});




// COUNT OF INSTRUCTORS (filtered by course)
router.get("/count/instructors", async (req: Request, res: Response): Promise<void> => {
  const course = req.query.course as string;

  if (!course) {
    res.status(400).json({ message: "Course data is missing" });
    return;
  }

  try {
    const count = await UserModel.countDocuments({ role: "instructor", course });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching instructor count" });
  }
});


// COUNT OF SCHEDULES TODAY
router.get("/schedules-count/today", async (req: Request, res: Response) => {
  try {
    const today = new Date();

    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayOfWeek = days[today.getDay()];

    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const count = await Schedule.countDocuments({
      [`days.${dayOfWeek}`]: true,
      semesterStartDate: { $lte: todayStr },
      semesterEndDate: { $gte: todayStr },
    });

    res.json({ count });
  } catch (error) {
    console.error("Error counting today's schedules:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/logs/faculty-today", async (req: Request, res: Response): Promise<void> => {
  const { facultyId } = req.query;

  if (!facultyId) {
    res.status(400).json({ message: "facultyId is missing" });
    return;
  }

  try {
    // Step 1: Find all schedules where the instructor._id matches facultyId
    const schedules = await Schedule.find({
      instructor: facultyId,
    });

    if (!schedules || schedules.length === 0) {
      res.status(404).json({ message: "No schedules found for this faculty" });
      return;
    }

    // Step 2: Find logs where the schedule._id matches any of the schedules found in step 1
    const scheduleIds = schedules.map(schedule => schedule._id);
    const logs = await Log.find({
      schedule: { $in: scheduleIds }, // Match any log where the schedule is in the list of scheduleIds
    });

    // If no logs are found
    if (!logs || logs.length === 0) {
      res.status(404).json({ message: "No logs found for today for this faculty" });
      return;
    }

    // Step 3: Return the logs with all the details
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get("/logs/all-faculties/today", async (req: Request, res: Response): Promise<void> => {
  const { courseName } = req.query;

  if (!courseName) {
    res.status(400).json({ message: "courseName is missing" });
    return;
  }

  try {
    const now = new Date();
    const todayStr = now.toLocaleDateString("en-CA");

    const logsToday = await Log.find({ 
        date: todayStr,
        course: courseName
      })
      .select("timeIn timeout schedule")
      .populate({
        path: 'schedule',
        select: 'instructor',
        populate: {
          path: 'instructor',
          select: 'first_name last_name',
        }
      });

    if (!logsToday || logsToday.length === 0) {
      res.status(404).json({ message: "No logs found for today" });
      return;
    }

    const logsWithInstructor = logsToday.map((log: any) => {
      const { first_name, last_name } = log.schedule?.instructor || {};
      const fullName = `${first_name} ${last_name}`.trim();

      return {
        timeIn: log.timeIn,
        timeout: log.timeout,
        instructorName: fullName || "Instructor name not found",
      };
    });

    res.status(200).json(logsWithInstructor);
  } catch (error) {
    console.error("Error fetching today's logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



// LOGIN ROUTE
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username })
      .populate("college", "name code")
      .exec();

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        role: user.role,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        status: user.status,
        college: user.college,
        course: user.course || null,
      },
      requiresUpdate: user.status === "temporary",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// GET FACULTY LIST
router.get("/faculty", async (req: Request, res: Response): Promise<void> => {
  const { courseName } = req.query;

  if (!courseName) {
    res.status(400).json({ message: "courseName is missing" });
    return;
  }

  try {
    const facultyList = await UserModel.find({
      role: "instructor",
      course: courseName,
    }).select("first_name middle_name last_name username email role status");

    res.json(facultyList);
  } catch (error) {
    console.error("Error fetching faculty by course:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// DELETE FACULTY ACCOUNT
router.delete("/faculty/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const faculty = await UserModel.findById(id);
    if (!faculty) {
      res.status(404).json({ message: "UserModel not found" });
      return;
    }

    await UserModel.findByIdAndDelete(id);
    res.json({ message: "UserModel account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// CREATE NEW FACULTY ACCOUNT
router.post("/faculty", async (req: Request, res: Response): Promise<void> => {
  console.log(req.body);
  try {
    const {
      last_name,
      first_name,
      middle_name,
      email,
      username,
      password,
      role,
      college: collegeCode,
      course,
    } = req.body;

    if (!last_name || !first_name || !username || !email || !password || !role || !collegeCode || !course) {
      res.status(400).json({ message: "Please provide all required fields, including college and course" });
      return;
    }

    const validRoles = ["superadmin", "instructor", "programchairperson", "dean"];
    if (!validRoles.includes(role)) {
      res.status(400).json({ message: "Invalid role." });
      return;
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const existingUserUsername = await UserModel.findOne({ username });
    if (existingUserUsername) {
      res.status(400).json({ message: "Username already exists" });
      return;
    }

    const collegeDoc = await CollegeModel.findOne({ code: collegeCode });
    if (!collegeDoc) {
      res.status(400).json({ message: "Invalid college code" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      last_name,
      first_name,
      middle_name: middle_name || "",
      username,
      email,
      password: hashedPassword,
      role,
      status: "temporary",
      college: collegeDoc._id,
      course,
    });

    await newUser.save();

    const mailOptions = {
      from: 'Eduvision Team',
      to: newUser.email,
      subject: 'Welcome to EduVision!',
      text: `Hello ${newUser.first_name},

      Your faculty account has been created successfully.

      Here are your login details:
      Username: ${newUser.username}
      Please login and change your password immediately.

      Thank you,
      EduVision Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(201).json({
      _id: newUser._id,
      last_name: newUser.last_name,
      first_name: newUser.first_name,
      middle_name: newUser.middle_name,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      college: newUser.college,
      course: newUser.course,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/instructors", async (req: Request, res: Response): Promise<void> => {
  try {
    const instructors = await UserModel.find({ role: "instructor" }).select("first_name middle_name last_name");
    res.json(instructors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching instructors" });
  }
});

// GET SCHEDULES ROUTE
router.get("/schedules", async (req: Request, res: Response): Promise<void> => {
  const { shortCourseName } = req.query;

  if (!shortCourseName) {
    res.status(400).json({ message: "shortCourseName is missing" });
    return;
  }

  try {
    const regex = new RegExp(`^${shortCourseName}`, "i");
    const schedules = await Schedule.find({ courseCode: { $regex: regex } })
      .populate("instructor");

    res.json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching schedules", error });
  }
});

// GET SCHEDULES OF SPECIFIC FACULTY
router.get("/schedules-faculty", async (req: Request, res: Response): Promise<void> => {
  const { facultyId } = req.query;

  if (!facultyId) {
    res.status(400).json({ message: "facultyId is required" });
    return;
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(facultyId as string)) {
      res.status(400).json({ message: "Invalid facultyId format" });
      return;
    }

    const schedules = await Schedule.find({ instructor: facultyId })

    res.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ message: "Error fetching schedules", error });
  }
});



// ADD NEW SCHEDULE ROUTE
router.post("/schedules", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      courseTitle,
      courseCode,
      instructor,
      room,
      startTime,
      endTime,
      days,
      semesterStartDate,
      semesterEndDate,
      section,
    } = req.body;

    if (
      !courseTitle ||
      !courseCode ||
      !instructor ||
      !room ||
      !startTime ||
      !endTime ||
      !days ||
      !semesterStartDate ||
      !semesterEndDate ||
      !section 
    ) {
      res.status(400).json({ message: "Please provide all required fields including semester dates and days." });
      return;
    }

    const validDays = ["mon", "tue", "wed", "thu", "fri", "sat"];
    const isValidDays = validDays.every(day => typeof days[day] === "boolean");

    if (!isValidDays) {
      res.status(400).json({ message: "Invalid days format." });
      return;
    }

    const newSchedule = new Schedule({
      courseTitle,
      courseCode,
      instructor,
      room,
      startTime,
      endTime,
      days,
      semesterStartDate,
      semesterEndDate,
      section,
    });

    await newSchedule.save();

    res.status(201).json({
      message: "Schedule created successfully.",
      schedule: newSchedule,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});



// GET SUBJECTS LIST
router.get("/subjects", async (req: Request, res: Response): Promise<void> => {
  try {
    const subjects = await Subject.find().select("courseCode courseTitle");
    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching subjects" });
  }
});

// GET ROOMS LIST
router.get("/rooms", async (req: Request, res: Response): Promise<void> => {
  try {
    const rooms = await Room.find().select("name");
    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

// GET SECTIONS LIST
router.get("/sections", async (req: Request, res: Response): Promise<void> => {
  try {
    const sections = await Section.find().select("course section block");
    res.json(sections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching sections" });
  }
});

interface ScheduleInput {
  courseCode: string;
  courseTitle: string;
  section: mongoose.Types.ObjectId;
  instructor: mongoose.Types.ObjectId;
  room: string;
  startTime: string;
  endTime: string;
  semesterStartDate: string;
  semesterEndDate: string;
  days: {
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
  };
  displaySection?: string;
}


// PARSE AND UPLOAD TEACHING LOAD DOCUMENT
router.post("/uploadScheduleDocument", upload.single("scheduleDocument"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      console.log("❌ No file uploaded.");
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const filePath = req.file.path;
    console.log("📄 Uploaded file path:", filePath);

    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value;
    console.log("📄 Extracted text (first 500 chars):", text.slice(0, 500));

    fs.unlink(filePath, () => {
      console.log("🧹 Temp file cleaned up.");
    });

    const semAyMatch = text.match(/(\d(?:ST|ND|RD|TH))\s+Semester,\s*AY\s*(\d{4})-(\d{4})/i);
    let semester = "TBD";
    let semesterStartDate = "TBD";
    let semesterEndDate = "TBD";

    if (semAyMatch) {
      semester = semAyMatch[1].toUpperCase();
      const startYear = parseInt(semAyMatch[2], 10);
      const endYear = parseInt(semAyMatch[3], 10);

      if (semester === "1ST") {
        semesterStartDate = `${startYear}-08-01`;
        semesterEndDate = `${startYear}-12-15`;
      } else if (semester === "2ND") {
        semesterStartDate = `${endYear}-01-10`;
        semesterEndDate = `${endYear}-05-30`;
      }

      console.log(`🗓 Parsed semester: ${semester}, AY: ${startYear}-${endYear}`);
      console.log(`🗓 Semester dates: ${semesterStartDate} to ${semesterEndDate}`);
    } else {
      console.warn("⚠️ Semester and AY not found, using default dates.");
    }

    const instructorNameMatch = text.match(/Name of Instructor:\s*(.*)/i);
    const instructorFullName = instructorNameMatch ? instructorNameMatch[1].trim().toUpperCase() : "";
    console.log("👨‍🏫 Parsed instructor name:", instructorFullName);

    const instructor = await UserModel.findOne({
      $expr: {
        $regexMatch: {
          input: { $concat: ["$first_name", " ", "$middle_name", " ", "$last_name"] },
          regex: instructorFullName.replace(/\s+/g, ".*"),
          options: "i"
        }
      }
    });

    if (!instructor) {
      console.log("❌ Instructor not found in DB.");
      res.status(404).json({ message: "Instructor not found in database" });
      return;
    }

    console.log("✅ Instructor found:", `${instructor.first_name} ${instructor.middle_name} ${instructor.last_name}`);

    const lines = text.split("\n").map(line => line.trim()).filter(Boolean);
    console.log("🔍 Total extracted lines:", lines.length);

    let currentCourseCode = "";
    let currentCourseTitle = "";
    let currentSection = "";
    const schedules: ScheduleInput[] = [];

    const getDaysObj = (dayStr: string) => ({
      mon: /M/.test(dayStr),
      tue: /T(?!h)/.test(dayStr),
      wed: /W/.test(dayStr),
      thu: /Th|H/.test(dayStr),
      fri: /F/.test(dayStr),
      sat: /S/.test(dayStr),
    });

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const courseCodeMatch = line.match(/^(IS|IT)\s*\d{3}/);
      if (courseCodeMatch) {
        currentCourseCode = courseCodeMatch[0];
        const courseLine = lines[i + 1] || "";
        currentCourseTitle = lines[i + 1]?.split("(")[0]?.trim() || "";
        console.log("📘 Found course:", currentCourseCode, "-", currentCourseTitle);

        const sectionMatch = courseLine.match(/\(([^)]+)\)/);
        currentSection = sectionMatch ? sectionMatch[1].trim() : "Unknown";

        console.log("📘 Found course:", currentCourseCode, "-", currentCourseTitle, "| Section:", currentSection);
        continue;
      }

      const timeMatch = line.match(/(\d{2}:\d{2})\s*–\s*(\d{2}:\d{2})\s*\((lec|lab)\)/i);
      if (timeMatch) {
        const [ , startTime, endTime, type ] = timeMatch;
        const dayStr = lines[i + 1] || "";
        const days = getDaysObj(dayStr);

        const [courseCodePart, sectionBlock] = currentSection.split(" ");
        const sectionLevel = sectionBlock?.[0];
        const blockLetter = sectionBlock?.[1];

        const sectionDoc = await Section.findOne({
          course: new RegExp(courseCodePart, "i"),
          section: sectionLevel,
          block: blockLetter,
        });

        if (!sectionDoc) {
          console.warn(`⚠️ Section not found: ${currentSection}`);
          continue;
        }

        schedules.push({
          courseCode: currentCourseCode,
          courseTitle: currentCourseTitle,
          section: sectionDoc._id as mongoose.Types.ObjectId,
          instructor: instructor._id,
          room: "TBD",
          startTime,
          endTime,
          semesterStartDate,
          semesterEndDate,
          days,
          displaySection: `${sectionDoc.course} ${sectionDoc.section}${sectionDoc.block}`,
        });

        console.log(`🗓 Added ${type} for ${currentCourseCode}: ${startTime}–${endTime} on ${dayStr}`);
      }
    }

    console.log("📤 Parsed schedules ready to return:", JSON.stringify(schedules, null, 2));

    res.status(200).json({
      message: "Preview parsed data",
      data: schedules,
      instructorName: `${instructor.last_name}, ${instructor.first_name} ${instructor.middle_name} `,
      academicYear: `${semAyMatch?.[2]}-${semAyMatch?.[3]}`,
      semester: semester,
    });

  } catch (error) {
    console.error("🔥 Error while processing document:", error);
    res.status(500).json({ message: "Failed to process document", error });
  }
});


router.post("/confirmSchedules", async (req: Request, res: Response): Promise<void> => {
  try {
    const schedules = req.body.schedules;
    const saved = await Schedule.insertMany(schedules);
    res.status(201).json({ message: "Schedules saved successfully", data: saved });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save schedules" });
  }
});


export default router;
