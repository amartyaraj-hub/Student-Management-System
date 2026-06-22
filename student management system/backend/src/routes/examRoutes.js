import express from 'express';
import {
  createExam,
  getExams,
  getExamById,
  deleteExam,
  enterMarks,
  getExamResults,
  getStudentReportCard
} from '../controllers/examController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('admin', 'teacher'), createExam)
  .get(getExams);

router
  .route('/:id')
  .get(getExamById)
  .delete(authorizeRoles('admin'), deleteExam);

router.post('/:id/marks', authorizeRoles('admin', 'teacher'), enterMarks);
router.get('/:id/results', getExamResults);
router.get('/student/:studentId/report-card', getStudentReportCard);

export default router;
