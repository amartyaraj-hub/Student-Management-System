import express from 'express';
import {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject
} from '../controllers/subjectController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('admin'), createSubject)
  .get(getSubjects);

router
  .route('/:id')
  .get(getSubjectById)
  .put(authorizeRoles('admin'), updateSubject)
  .delete(authorizeRoles('admin'), deleteSubject);

export default router;
