import express from 'express'
import paymentController from '../controllers/payment.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.middleware.js'
import { checkoutRateLimit } from '../middleware/rate-limit.middleware.js'
import { checkoutSchema } from '../validations/payment.validation.js'

const router = express.Router()

/* ===== CREATE CHECKOUT SESSION ===== */
router.post(
  '/checkout',
  authMiddleware,
  checkoutRateLimit,
  validate(checkoutSchema),
  paymentController.checkout
)

export default router
