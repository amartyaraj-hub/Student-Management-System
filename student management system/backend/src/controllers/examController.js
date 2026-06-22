import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import Student from '../models/Student.js';

// @desc    Create a new exam
// @route   POST /api/exams
// @access  Private (Admin, Teacher)
export const createExam = async (req, res, next) => {
  try {
    const { name, type, classId, date, maxMarks } = req.body;

    const exam = await Exam.create({
      name,
      type,
      class: classId,
      date,
      maxMarks: maxMarks || 100
    });

    res.status(201).json({
      success: true,
      data: exam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
export const getExams = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const query = {};
    if (classId) query.class = classId;

    const exams = await Exam.find(query).populate('class', 'name section');

    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exam
// @route   GET /api/exams/:id
// @access  Private
export const getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('class', 'name section');

    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }

    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enter student marks for an exam
// @route   POST /api/exams/:id/marks
// @access  Private (Admin, Teacher)
export const enterMarks = async (req, res, next) => {
  try {
    const examId = req.params.id;
    const { resultsList } = req.body; // Array of { studentId, subjectsMarks: [{ subject, obtainedMarks, maxMarks }] }

    if (!resultsList || !Array.isArray(resultsList)) {
      return res.status(400).json({ success: false, error: 'Please provide a resultsList' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }

    // Save/Update result documents (triggers pre-save middleware for grade & percentage)
    for (const resultData of resultsList) {
      const { studentId, subjectsMarks, remarks } = resultData;

      // Find or create result
      let resultDoc = await Result.findOne({ exam: examId, student: studentId });
      if (!resultDoc) {
        resultDoc = new Result({
          exam: examId,
          student: studentId
        });
      }

      resultDoc.subjectsMarks = subjectsMarks;
      resultDoc.remarks = remarks || '';
      await resultDoc.save();
    }

    // Calculate Class Ranks
    const results = await Result.find({ exam: examId }).sort({ percentage: -1 });
    for (let i = 0; i < results.length; i++) {
      results[i].classRank = i + 1;
      await results[i].save();
    }

    // Update Exam status to Completed
    exam.status = 'Completed';
    await exam.save();

    res.status(200).json({
      success: true,
      message: 'Marks entered and ranks recalculated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get marks and ranks for a specific exam
// @route   GET /api/exams/:id/results
// @access  Private
export const getExamResults = async (req, res, next) => {
  try {
    const examId = req.params.id;

    const results = await Result.find({ exam: examId })
      .populate('student', 'name studentId rollNo')
      .populate({
        path: 'subjectsMarks.subject',
        select: 'name code'
      })
      .sort({ classRank: 1 });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get report card for a single student
// @route   GET /api/exams/student/:studentId/report-card
// @access  Private
export const getStudentReportCard = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Check auth
    if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ user: req.user._id });
      if (!studentProfile || studentProfile._id.toString() !== studentId) {
        return res.status(403).json({ success: false, error: 'Not authorized to view these records' });
      }
    }

    const results = await Result.find({ student: studentId })
      .populate('exam', 'name type date')
      .populate({
        path: 'subjectsMarks.subject',
        select: 'name code'
      });

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private/Admin
export const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }

    // Delete associated results
    await Result.deleteMany({ exam: exam._id });
    await exam.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
