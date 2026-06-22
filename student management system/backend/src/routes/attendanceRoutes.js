import express from 'express';
import {
  markAttendance,
  getClassAttendance,
  getStudentAttendanceSummary
} from '../controllers/attendanceController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorizeRoles('admin', 'teacher'), markAttendance);
router.get('/class/:classId', authorizeRoles('admin', 'teacher'), getClassAttendance);
router.get('/student/:studentId', getStudentAttendanceSummary);

export default router;
