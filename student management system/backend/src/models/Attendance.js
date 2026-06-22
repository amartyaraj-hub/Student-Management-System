import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      default: 'Present'
    },
    remarks: {
      type: String,
      trim: true
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Enforce unique attendance entry for a student on a specific date
AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', AttendanceSchema);
