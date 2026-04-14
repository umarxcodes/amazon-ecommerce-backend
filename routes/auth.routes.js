import express from 'express'
import authController from '../controllers/auth.controller.js'
import validate from '../middleware/validate.middleware.js'
import {
  authRouteRateLimit,
  loginRateLimit,
} from '../middleware/rate-limit.middleware.js'
import { registerSchema, loginSchema } from '../validations/auth.validation.js'

const router = express.Router()

router.post(
  '/register',
  authRouteRateLimit,
  validate(registerSchema),
  authController.register
)
router.post(
  '/login',
  loginRateLimit,
  validate(loginSchema),
  authController.login
)

export default router
