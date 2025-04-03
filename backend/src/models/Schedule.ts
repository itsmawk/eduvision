import mongoose, { Document, Schema } from "mongoose";

export interface ISchedule extends Document {
  subjectName: string;
  subjectCode: string;
  instructor: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
}

const ScheduleSchema: Schema = new Schema({
  subjectName: { type: String, required: true },
  subjectCode: { type: String, required: true },
  instructor: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
  room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

export default mongoose.model<ISchedule>("Schedule", ScheduleSchema);
