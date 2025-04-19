import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import "./College";

export type UserRole = 
  | 'superadmin'
  | 'instructor'
  | 'dean'
  | `programchairperson-${string}`;

export interface IUser extends Document {
  _id: Types.ObjectId;
  first_name: string;
  middle_name?: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  college?: mongoose.Types.ObjectId; 
  course?: string;
  status: 'temporary' | 'permanent';
}

const UserSchema: Schema<IUser> = new Schema({
  first_name: { type: String, required: true },
  middle_name: { type: String, default: "" },
  last_name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    validate: {
      validator: function (value: string) {
        return (
          ['superadmin', 'instructor', 'dean'].includes(value) ||
          /^programchairperson-[a-z0-9]+$/i.test(value)
        );
      },
      message: (props: any) => `${props.value} is not a valid role format`
    }
  },
  college: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },
  course: { type: String },
  status: {
    type: String,
    enum: ['temporary', 'permanent'],
    default: 'temporary'
  }
});

UserSchema.pre('validate', function (next) {
  const doc = this as IUser;
  const isProgramChair = /^programchairperson-[a-z0-9]+$/i.test(doc.role);

  if (doc.role === 'superadmin') {
    doc.college = undefined;
    doc.course = undefined;
  } else if (doc.role === 'dean') {
    if (!doc.college) {
      return next(new Error('College is required for dean'));
    }
    doc.course = undefined;
  } else if (isProgramChair || doc.role === 'instructor') {
    if (!doc.college || !doc.course) {
      return next(new Error('College and Course are required for instructors and program chairpersons'));
    }
  }

  next();
});

const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default UserModel;
