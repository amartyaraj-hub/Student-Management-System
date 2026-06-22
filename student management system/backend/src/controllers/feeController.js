import Fee from '../models/Fee.js';
import Student from '../models/Student.js';

// @desc    Create a fee invoice (supports single student or whole class)
// @route   POST /api/fees
// @access  Private/Admin
export const createFeeInvoice = async (req, res, next) => {
  try {
    const { studentId, classId, title, totalAmount, dueDate } = req.body;

    if (!title || !totalAmount || !dueDate) {
      return res.status(400).json({ success: false, error: 'Please provide title, totalAmount, and dueDate' });
    }

    // Class-wide fee allocation
    if (classId && !studentId) {
      const students = await Student.find({ class: classId });
      if (students.length === 0) {
        return res.status(404).json({ success: false, error: 'No students found in the specified class' });
      }

      const invoices = students.map(student => ({
        student: student._id,
        title,
        totalAmount,
        dueDate: new Date(dueDate)
      }));

      await Fee.insertMany(invoices);

      return res.status(201).json({
        success: true,
        message: `Fee invoices generated successfully for ${students.length} students in class`
      });
    }

    // Single student allocation
    if (!studentId) {
      return res.status(400).json({ success: false, error: 'Please provide studentId or classId' });
    }

    const fee = await Fee.create({
      student: studentId,
      title,
      totalAmount,
      dueDate: new Date(dueDate)
    });

    res.status(201).json({
      success: true,
      data: fee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a payment on a fee invoice
// @route   POST /api/fees/:id/pay
// @access  Private/Admin
export const recordPayment = async (req, res, next) => {
  try {
    const feeId = req.params.id;
    const { amount, method, transactionId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Please provide a valid payment amount' });
    }

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ success: false, error: 'Fee invoice not found' });
    }

    if (fee.status === 'Paid') {
      return res.status(400).json({ success: false, error: 'This invoice is already fully paid' });
    }

    if (amount > fee.remainingAmount) {
      return res.status(400).json({
        success: false,
        error: `Payment amount exceeds remaining balance. Max allowed: $${fee.remainingAmount}`
      });
    }

    // Update payment details
    fee.paidAmount += Number(amount);
    fee.paymentHistory.push({
      amount: Number(amount),
      method: method || 'Online',
      transactionId: transactionId || `TXN-${Date.now()}`
    });

    await fee.save(); // pre-save recalculates balance and status

    res.status(200).json({
      success: true,
      data: fee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all fee records
// @route   GET /api/fees
// @access  Private
export const getFees = async (req, res, next) => {
  try {
    const { status, studentId } = req.query;
    const query = {};

    if (status) query.status = status;

    if (studentId) {
      query.student = studentId;
    } else if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ user: req.user._id });
      if (studentProfile) {
        query.student = studentProfile._id;
      } else {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
    }

    const fees = await Fee.find(query)
      .populate({
        path: 'student',
        select: 'name studentId rollNo',
        populate: {
          path: 'class',
          select: 'name section'
        }
      })
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: fees.length,
      data: fees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single fee invoice details
// @route   GET /api/fees/:id
// @access  Private
export const getFeeById = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id).populate('student', 'name studentId parentName parentPhone');

    if (!fee) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    res.status(200).json({
      success: true,
      data: fee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending fee alerts (Overdue accounts)
// @route   GET /api/fees/pending/alerts
// @access  Private (Admin)
export const getPendingFeeAlerts = async (req, res, next) => {
  try {
    const currentDate = new Date();

    const overdueFees = await Fee.find({
      status: { $ne: 'Paid' },
      dueDate: { $lt: currentDate }
    }).populate('student', 'name studentId parentPhone parentName');

    res.status(200).json({
      success: true,
      count: overdueFees.length,
      data: overdueFees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete invoice
// @route   DELETE /api/fees/:id
// @access  Private/Admin
export const deleteFee = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ success: false, error: 'Fee invoice not found' });
    }

    await fee.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
