import mongoose, { Document, Schema } from 'mongoose';

export type FacultyRole = 'admin' | 'instructor';

export interface IFaculty extends Document {
  _id: mongoose.Types.ObjectId;
  first_name: string;
  middle_name?: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  role: FacultyRole;
  status: string;
}

const FacultySchema: Schema = new Schema({
  first_name: { type: String, required: true },
  middle_name: { type: String, required: false, default: "" },
  last_name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'instructor'], required: true },
  status: { type: String, enum: ['temporary', 'permanent'], default: 'temporary' }
});

export default mongoose.model<IFaculty>('Faculty', FacultySchema);
