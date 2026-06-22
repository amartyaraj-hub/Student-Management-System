import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Class from '../models/Class.js';
import Attendance from '../models/Attendance.js';
import Fee from '../models/Fee.js';

// @desc    Get aggregate statistics for the dashboard
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Core Counts
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalClasses = await Class.countDocuments();

    // 2. Fees collection stats
    const feeInvoices = await Fee.find();
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalPending = 0;

    feeInvoices.forEach(fee => {
      totalInvoiced += fee.totalAmount;
      totalCollected += fee.paidAmount;
      totalPending += fee.remainingAmount;
    });

    const feeCollectionRate = totalInvoiced > 0 ? Number(((totalCollected / totalInvoiced) * 100).toFixed(2)) : 0;

    // 3. Attendance Stats
    // Average attendance rate across all time
    const attendanceRecords = await Attendance.find();
    const totalAttendance = attendanceRecords.length;
    const presentAttendance = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const schoolAttendanceRate = totalAttendance > 0 ? Number(((presentAttendance / totalAttendance) * 100).toFixed(2)) : 100;

    // Attendance breakdown for charts
    const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'Absent').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'Late').length;

    // 4. Recent activities feed (admissions and payments)
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name studentId admissionDate');

    const recentPayments = await Fee.find({ 'paymentHistory.0': { $exists: true } })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('student', 'name studentId')
      .select('title paymentHistory');

    const activities = [];
    recentStudents.forEach(st => {
      activities.push({
        type: 'admission',
        message: `New student enrolled: ${st.name} (${st.studentId})`,
        date: st.admissionDate
      });
    });

    recentPayments.forEach(p => {
      const lastPayment = p.paymentHistory[p.paymentHistory.length - 1];
      if (lastPayment) {
        activities.push({
          type: 'payment',
          message: `Fee payment of $${lastPayment.amount} received for ${p.student ? p.student.name : 'Unknown Student'} - ${p.title}`,
          date: lastPayment.date
        });
      }
    });

    // Sort combined activities by date descending
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        fees: {
          totalInvoiced,
          totalCollected,
          totalPending,
          collectionRate: feeCollectionRate
        },
        attendance: {
          overallRate: schoolAttendanceRate,
          breakdown: {
            present: presentCount,
            absent: absentCount,
            late: lateCount
          }
        }
      },
      recentActivities: activities.slice(0, 8)
    });
  } catch (error) {
    next(error);
  }
};
