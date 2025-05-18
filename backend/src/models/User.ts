import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import "./College";

export type UserRole = 
  | 'superadmin'
  | 'instructor'
  | 'dean'
  | 'programchairperson';

export interface IUser extends Document {
  _id: Types.ObjectId;
  first_name: string;
  middle_name?: string;
  last_name: string;
  username: string;
  email: string;
  gender: string;
  birthdate: Date;
  highestEducationalAttainment: string;
  academicRank: string;
  statusOfAppointment: string;
  numberOfPrep: Number;
  totalTeachingLoad: Number;
  password: string;
  role: UserRole;
  college?: mongoose.Types.ObjectId;
  course?: string;
  status: 'forverification' | 'active' | 'inactive';
}

const UserSchema: Schema<IUser> = new Schema({
  first_name: { type: String, required: true },
  middle_name: { type: String, default: "" },
  last_name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, default: "" },
  birthdate: { type: Date, default: null },
  highestEducationalAttainment: { type: String, default: "" },
  academicRank: { type: String, default: "" },
  statusOfAppointment: { type: String, default: "" },
  numberOfPrep: { type: Number, default: 0 },
  totalTeachingLoad: { type: Number, default: 0 },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['superadmin', 'instructor', 'dean', 'programchairperson']
  },
  college: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },
  course: { type: String },
  status: {
    type: String,
    enum: ['forverification', 'active','inactive'],
    default: 'forverification'
  }
});

UserSchema.pre('validate', function (next) {
  const doc = this as IUser;

  if (doc.role === 'superadmin') {
    doc.college = undefined;
    doc.course = undefined;
  } else if (doc.role === 'dean') {
    if (!doc.college) return next(new Error('College is required for dean'));
    doc.course = undefined;
  } else if (doc.role === 'instructor' || doc.role === 'programchairperson') {
    if (!doc.college || !doc.course) {
      return next(new Error('College and Course are required for instructors and program chairpersons'));
    }
  }

  next();
});

const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default UserModel;
