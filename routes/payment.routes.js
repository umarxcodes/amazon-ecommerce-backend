import express from 'express'
import paymentController from '../controllers/payment.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.middleware.js'
import { checkoutRateLimit } from '../middleware/rate-limit.middleware.js'
import {
  checkoutSchema,
  confirmCheckoutSchema,
} from '../validations/payment.validation.js'

const router = express.Router()

router.post(
  '/checkout',
  authMiddleware,
  checkoutRateLimit,
  validate(checkoutSchema),
  paymentController.checkout
)

router.post(
  '/confirm',
  authMiddleware,
  checkoutRateLimit,
  validate(confirmCheckoutSchema),
  paymentController.confirmCheckout
)

export default router
