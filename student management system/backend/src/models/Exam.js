import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add exam name'],
      trim: true
    },
    type: {
      type: String,
      enum: ['Midterm', 'Final', 'Quiz', 'Assignment'],
      required: [true, 'Please specify exam type']
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    },
    date: {
      type: Date,
      required: [true, 'Please add exam date']
    },
    maxMarks: {
      type: Number,
      default: 100
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed'],
      default: 'Scheduled'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Exam', ExamSchema);
