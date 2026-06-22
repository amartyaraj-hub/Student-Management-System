import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

// @desc    Mark attendance for multiple students in a class
// @route   POST /api/attendance
// @access  Private (Admin, Teacher)
export const markAttendance = async (req, res, next) => {
  try {
    const { classId, date, attendanceList } = req.body;

    if (!classId || !date || !attendanceList || !Array.isArray(attendanceList)) {
      return res.status(400).json({ success: false, error: 'Please provide classId, date, and attendanceList' });
    }

    // Format date to remove time component (UTC Midnight)
    const formattedDate = new Date(date);
    formattedDate.setUTCHours(0, 0, 0, 0);

    const bulkOperations = attendanceList.map(item => ({
      updateOne: {
        filter: { student: item.studentId, date: formattedDate },
        update: {
          $set: {
            class: classId,
            status: item.status,
            remarks: item.remarks || '',
            markedBy: req.user._id
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(bulkOperations);

    res.status(200).json({
      success: true,
      message: `Attendance marked successfully for date ${formattedDate.toISOString().split('T')[0]}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance status for a class on a specific date
// @route   GET /api/attendance/class/:classId
// @access  Private (Admin, Teacher)
export const getClassAttendance = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, error: 'Please specify a date parameter' });
    }

    const searchDate = new Date(date);
    searchDate.setUTCHours(0, 0, 0, 0);

    // Fetch all students enrolled in this class
    const students = await Student.find({ class: classId }).select('name studentId rollNo');

    // Fetch marked attendance records for this date
    const markedAttendance = await Attendance.find({
      class: classId,
      date: searchDate
    }).select('student status remarks');

    const attendanceMap = new Map();
    markedAttendance.forEach(att => {
      attendanceMap.set(att.student.toString(), {
        status: att.status,
        remarks: att.remarks
      });
    });

    // Merge student roster with attendance details
    const data = students.map(student => {
      const marked = attendanceMap.get(student._id.toString());
      return {
        studentId: student._id,
        studentCodeId: student.studentId,
        name: student.name,
        rollNo: student.rollNo,
        status: marked ? marked.status : 'Present', // default if not marked yet
        remarks: marked ? marked.remarks : '',
        isNew: !marked
      };
    });

    res.status(200).json({
      success: true,
      date: searchDate,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance summary for a student
// @route   GET /api/attendance/student/:studentId
// @access  Private
export const getStudentAttendanceSummary = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Check auth
    if (req.user.role === 'student') {
      const currentStudent = await Student.findOne({ user: req.user._id });
      if (!currentStudent || currentStudent._id.toString() !== studentId) {
        return res.status(403).json({ success: false, error: 'Not authorized to view these records' });
      }
    }

    const records = await Attendance.find({ student: studentId }).sort({ date: -1 });

    const total = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const late = records.filter(r => r.status === 'Late').length;

    const attendanceRate = total > 0 ? Number(((present / total) * 100).toFixed(2)) : 100;

    res.status(200).json({
      success: true,
      summary: {
        total,
        present,
        absent,
        late,
        attendanceRate
      },
      records
    });
  } catch (error) {
    next(error);
  }
};
