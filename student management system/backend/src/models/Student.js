import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    studentId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Please add student name'],
      trim: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Please specify gender']
    },
    dob: {
      type: Date,
      required: [true, 'Please add date of birth']
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    parentName: {
      type: String,
      required: [true, 'Please add parent/guardian name'],
      trim: true
    },
    parentPhone: {
      type: String,
      required: [true, 'Please add parent/guardian phone number'],
      trim: true
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    rollNo: {
      type: Number
    },
    photo: {
      type: String,
      default: ''
    },
    admissionDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Student', StudentSchema);
