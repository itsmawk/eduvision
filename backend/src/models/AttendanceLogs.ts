import mongoose, { Document, Schema } from "mongoose";

export interface ILog extends Document {
  schedule: mongoose.Types.ObjectId;
  date: string;
  status: "present" | "late" | "absent" | "excuse";
  timeIn?: string;
  timeout?: string;
  remarks?: string;
  college: mongoose.Types.ObjectId;
  course: string;
}

const LogSchema: Schema = new Schema({
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule", required: true },
  date: { type: String, required: true },
  status: {
    type: String,
    enum: ["present", "late", "absent", "excuse"],
    required: true,
  },
  timeIn: { type: String },
  timeout: { type: String },
  remarks: { type: String },
  college: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },
  course: { type: String, required: true },
});

const Log = mongoose.model<ILog>("Log", LogSchema);

export default Log;
