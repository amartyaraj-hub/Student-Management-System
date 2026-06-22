import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add subject name'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Please add subject code'],
      unique: true,
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Subject', SubjectSchema);
