import mongoose, { Schema, Document } from 'mongoose';

export interface ISection extends Document {
  course: string;   // e.g. "BSIT"
  section: string;  // e.g. "1"
  block: string;    // e.g. "A"
}

const SectionSchema: Schema = new Schema({
  course: {
    type: String,
    required: true,
    trim: true,
  },
  section: {
    type: String,
    required: true,
    trim: true,
  },
  block: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model<ISection>('Section', SectionSchema);
