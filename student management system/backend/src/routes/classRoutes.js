import express from 'express';
import {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass
} from '../controllers/classController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('admin'), createClass)
  .get(getClasses);

router
  .route('/:id')
  .get(getClassById)
  .put(authorizeRoles('admin'), updateClass)
  .delete(authorizeRoles('admin'), deleteClass);

export default router;
