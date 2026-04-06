/*
📁 FILE: payment.routes.js
📌 PURPOSE: Declares payment-related endpoints and applies checkout-specific
authorization, validation, and rate limiting.
========================================
*/

import express from 'express'
import paymentController from '../controllers/payment.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.middleware.js'
import { checkoutRateLimit } from '../middleware/rate-limit.middleware.js'
import { checkoutSchema } from '../validations/payment.validation.js'

const router = express.Router()

/* ===== PAYMENT ROUTES ===== */
/* Checkout is protected because it operates on user-owned orders. */
router.post(
  '/checkout',
  authMiddleware,
  checkoutRateLimit,
  validate(checkoutSchema),
  paymentController.checkout
)

export default router
