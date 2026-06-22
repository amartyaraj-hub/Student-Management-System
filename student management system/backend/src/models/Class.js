import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add class name'],
      trim: true
    },
    section: {
      type: String,
      required: [true, 'Please add section'],
      trim: true,
      uppercase: true
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Compound index to ensure name + section is unique
ClassSchema.index({ name: 1, section: 1 }, { unique: true });

export default mongoose.model('Class', ClassSchema);
