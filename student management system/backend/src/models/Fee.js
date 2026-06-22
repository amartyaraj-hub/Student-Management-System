import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  method: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer', 'Online'],
    default: 'Online'
  },
  transactionId: {
    type: String,
    trim: true
  }
});

const FeeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please add fee title/term'],
      trim: true
    },
    totalAmount: {
      type: Number,
      required: [true, 'Please add total fee amount'],
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    remainingAmount: {
      type: Number
    },
    status: {
      type: String,
      enum: ['Paid', 'Partially Paid', 'Unpaid'],
      default: 'Unpaid'
    },
    dueDate: {
      type: Date,
      required: [true, 'Please add fee due date']
    },
    paymentHistory: [PaymentSchema]
  },
  {
    timestamps: true
  }
);

// Pre-save middleware to calculate remainingAmount and determine status
FeeSchema.pre('save', function (next) {
  this.remainingAmount = this.totalAmount - this.paidAmount;

  if (this.paidAmount === 0) {
    this.status = 'Unpaid';
  } else if (this.remainingAmount <= 0) {
    this.remainingAmount = 0;
    this.status = 'Paid';
  } else {
    this.status = 'Partially Paid';
  }

  next();
});

export default mongoose.model('Fee', FeeSchema);
