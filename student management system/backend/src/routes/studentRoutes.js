import express from 'express';
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} from '../controllers/studentController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('admin'), createStudent)
  .get(authorizeRoles('admin', 'teacher'), getStudents);

router
  .route('/:id')
  .get(getStudentById)
  .put(authorizeRoles('admin'), updateStudent)
  .delete(authorizeRoles('admin'), deleteStudent);

export default router;
