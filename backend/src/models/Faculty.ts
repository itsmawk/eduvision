import mongoose, { Document, Schema } from 'mongoose';

export type FacultyRole = 'admin' | 'instructor';

export interface IFaculty extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  role: FacultyRole;
}

const FacultySchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'instructor'], required: true },
});

export default mongoose.model<IFaculty>('Faculty', FacultySchema);