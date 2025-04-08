import mongoose, { Document, Schema } from "mongoose";

interface ISchedule extends Document {
  subjectName: string;
  subjectCode: string;
  instructor: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
}

const ScheduleSchema: Schema = new Schema(
  {
    subjectName: { type: String, required: true },
    subjectCode: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    room: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
);

const Schedule = mongoose.model<ISchedule>("Schedule", ScheduleSchema);

export default Schedule;
