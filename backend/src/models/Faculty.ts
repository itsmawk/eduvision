import mongoose, { Document, Schema } from 'mongoose';

export type FacultyRole = 'admin' | 'instructor';

export interface IFaculty extends Document {
  _id: mongoose.Types.ObjectId;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  password: string;
  role: FacultyRole;
}

const FacultySchema: Schema = new Schema({
  first_name: { type: String, required: true },
  middle_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'instructor'], required: true },
});

export default mongoose.model<IFaculty>('Faculty', FacultySchema);