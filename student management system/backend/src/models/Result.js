import mongoose from 'mongoose';

const SubjectMarkSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  obtainedMarks: {
    type: Number,
    required: true,
    min: 0
  },
  maxMarks: {
    type: Number,
    required: true,
    default: 100
  },
  grade: {
    type: String
  },
  remarks: {
    type: String,
    trim: true
  }
});

const ResultSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    subjectsMarks: [SubjectMarkSchema],
    totalObtained: {
      type: Number,
      default: 0
    },
    totalMax: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    overallGrade: {
      type: String
    },
    remarks: {
      type: String,
      trim: true
    },
    classRank: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

// Enforce unique results per student per exam
ResultSchema.index({ exam: 1, student: 1 }, { unique: true });

// Pre-save middleware to calculate total obtained, percentage, and grades
ResultSchema.pre('save', function (next) {
  let obtainedSum = 0;
  let maxSum = 0;

  const calculateGrade = (score, max) => {
    const percent = (score / max) * 100;
    if (percent >= 90) return 'A+';
    if (percent >= 80) return 'A';
    if (percent >= 70) return 'B';
    if (percent >= 60) return 'C';
    if (percent >= 50) return 'D';
    return 'F';
  };

  this.subjectsMarks.forEach(sm => {
    obtainedSum += sm.obtainedMarks;
    maxSum += sm.maxMarks;
    sm.grade = calculateGrade(sm.obtainedMarks, sm.maxMarks);
  });

  this.totalObtained = obtainedSum;
  this.totalMax = maxSum;
  this.percentage = maxSum > 0 ? Number(((obtainedSum / maxSum) * 100).toFixed(2)) : 0;
  this.overallGrade = calculateGrade(obtainedSum, maxSum);

  next();
});

export default mongoose.model('Result', ResultSchema);
