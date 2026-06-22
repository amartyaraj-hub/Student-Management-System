import express from 'express';
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher
} from '../controllers/teacherController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('admin'), createTeacher)
  .get(authorizeRoles('admin', 'teacher'), getTeachers);

router
  .route('/:id')
  .get(getTeacherById)
  .put(authorizeRoles('admin'), updateTeacher)
  .delete(authorizeRoles('admin'), deleteTeacher);

export default router;
