import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  subjectName: string;
  subjectCode: string;
}

const SubjectSchema: Schema = new Schema({
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  subjectCode: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }
});

export default mongoose.model<ISubject>('Subject', SubjectSchema);
