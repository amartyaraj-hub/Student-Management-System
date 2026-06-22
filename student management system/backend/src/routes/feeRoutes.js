import express from 'express';
import {
  createFeeInvoice,
  getFees,
  getFeeById,
  recordPayment,
  getPendingFeeAlerts,
  deleteFee
} from '../controllers/feeController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorizeRoles('admin'), createFeeInvoice)
  .get(getFees);

router.get('/alerts', authorizeRoles('admin'), getPendingFeeAlerts);

router
  .route('/:id')
  .get(getFeeById)
  .delete(authorizeRoles('admin'), deleteFee);

router.post('/:id/pay', authorizeRoles('admin'), recordPayment);

export default router;
