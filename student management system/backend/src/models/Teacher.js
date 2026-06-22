import mongoose from 'mongoose';

const TeacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    teacherId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Please add teacher name'],
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
      required: [true, 'Please add phone number'],
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    qualification: {
      type: String,
      required: [true, 'Please add teacher qualification'],
      trim: true
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    photo: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Teacher', TeacherSchema);
