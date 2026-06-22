import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Result from '../models/Result.js';
import Fee from '../models/Fee.js';
import { generatePDFReport } from '../utils/pdfGenerator.js';
import { generateExcelReport } from '../utils/excelGenerator.js';

// @desc    Export student list as PDF or Excel
// @route   GET /api/reports/students/export
// @access  Private (Admin, Teacher)
export const exportStudentsReport = async (req, res, next) => {
  try {
    const { format, classId } = req.query;
    const query = {};
    if (classId) query.class = classId;

    const students = await Student.find(query)
      .populate('class', 'name section')
      .populate('user', 'email');

    const headers = ['Student ID', 'Roll No', 'Name', 'Gender', 'Email', 'Class', 'Parent Phone'];
    const rows = students.map(s => [
      s.studentId,
      s.rollNo || '-',
      s.name,
      s.gender,
      s.user ? s.user.email : '-',
      s.class ? `${s.class.name}-${s.class.section}` : 'Unassigned',
      s.parentPhone
    ]);

    if (format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=students_report.xlsx');
      await generateExcelReport(res, 'Student Roster', headers, rows);
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=students_report.pdf');
      generatePDFReport(res, 'Student Directory Report', headers, rows);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Export attendance logs
// @route   GET /api/reports/attendance/export
// @access  Private (Admin, Teacher)
export const exportAttendanceReport = async (req, res, next) => {
  try {
    const { format, classId, date } = req.query;

    if (!classId || !date) {
      return res.status(400).json({ success: false, error: 'Please provide classId and date' });
    }

    const searchDate = new Date(date);
    searchDate.setUTCHours(0, 0, 0, 0);

    const records = await Attendance.find({ class: classId, date: searchDate })
      .populate('student', 'name studentId rollNo')
      .sort({ 'student.rollNo': 1 });

    const headers = ['Roll No', 'Student ID', 'Name', 'Status', 'Date', 'Remarks'];
    const rows = records.map(r => [
      r.student ? r.student.rollNo || '-' : '-',
      r.student ? r.student.studentId : '-',
      r.student ? r.student.name : 'Unknown Student',
      r.status,
      searchDate.toISOString().split('T')[0],
      r.remarks || '-'
    ]);

    if (format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.xlsx');
      await generateExcelReport(res, 'Attendance Record', headers, rows);
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.pdf');
      generatePDFReport(res, 'Class Daily Attendance Report', headers, rows);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Export exam results report
// @route   GET /api/reports/results/export
// @access  Private (Admin, Teacher)
export const exportAcademicReport = async (req, res, next) => {
  try {
    const { format, examId } = req.query;

    if (!examId) {
      return res.status(400).json({ success: false, error: 'Please specify examId' });
    }

    const results = await Result.find({ exam: examId })
      .populate('student', 'name studentId rollNo')
      .populate('exam', 'name type')
      .sort({ classRank: 1 });

    const headers = ['Rank', 'Roll No', 'Student ID', 'Name', 'Obtained', 'Total', 'Percentage', 'Grade'];
    const rows = results.map(r => [
      r.classRank || '-',
      r.student ? r.student.rollNo || '-' : '-',
      r.student ? r.student.studentId : '-',
      r.student ? r.student.name : '-',
      r.totalObtained,
      r.totalMax,
      `${r.percentage}%`,
      r.overallGrade
    ]);

    const examTitle = results.length > 0 && results[0].exam ? results[0].exam.name : 'Exam Performance';

    if (format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=academic_report.xlsx');
      await generateExcelReport(res, examTitle, headers, rows);
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=academic_report.pdf');
      generatePDFReport(res, `${examTitle} - Ranks and Scores`, headers, rows);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Export fee collection ledger
// @route   GET /api/reports/fees/export
// @access  Private (Admin)
export const exportFeesReport = async (req, res, next) => {
  try {
    const { format, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const fees = await Fee.find(query).populate('student', 'name studentId');

    const headers = ['Student ID', 'Name', 'Term/Title', 'Total Fee', 'Paid Amount', 'Remaining', 'Status', 'Due Date'];
    const rows = fees.map(f => [
      f.student ? f.student.studentId : '-',
      f.student ? f.student.name : 'Unknown Student',
      f.title,
      `$${f.totalAmount}`,
      `$${f.paidAmount}`,
      `$${f.remainingAmount}`,
      f.status,
      new Date(f.dueDate).toISOString().split('T')[0]
    ]);

    if (format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=fees_report.xlsx');
      await generateExcelReport(res, 'Fee Collections Ledgers', headers, rows);
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=fees_report.pdf');
      generatePDFReport(res, 'Fee Collection Summary Ledger', headers, rows);
    }
  } catch (error) {
    next(error);
  }
};
