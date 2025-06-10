import mongoose, { Schema, Document } from "mongoose";

export interface ITempAcc extends Document {
  email: string;
  role: "faculty" | "programchairperson" | "dean"; // adjust roles as needed
  department: mongoose.Types.ObjectId; // references College
  program?: mongoose.Types.ObjectId;   // optional, references Course
  profilePhoto: string;
}

const TempAccSchema: Schema<ITempAcc> = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["faculty", "programchairperson", "dean"],
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true,
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: function (this: ITempAcc) {
      return this.role !== "dean"; // program is optional for dean
    },
  },
  profilePhoto: {
    type: String,
    required: true,
  },
});

export default mongoose.model<ITempAcc>("TempAcc", TempAccSchema);
