/*
📁 FILE: auth.routes.js
📌 PURPOSE: Declares authentication-related endpoints and composes the
middleware stack for validation, rate limiting, and authorization.
========================================
*/

/* ===== IMPORTS ===== */
import express from 'express'
import authController from '../controllers/auth.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import adminMiddleware from '../middleware/admin.middleware.js'
import validate from '../middleware/validate.middleware.js'
import {
  authRouteRateLimit,
  loginRateLimit,
} from '../middleware/rate-limit.middleware.js'
import { registerSchema, loginSchema } from '../validations/auth.validation.js'

const router = express.Router()

/* ===== AUTH ROUTES ===== */
/* Public routes cover registration and login, while admin-create is protected. */
router.post(
  '/register',
  authRouteRateLimit,
  validate(registerSchema),
  authController.register
)
router.post('/login', loginRateLimit, validate(loginSchema), authController.login)

/* ================================* ADMIN CREATE USER *=============================== */
router.post(
  '/admin-create',
  authMiddleware,
  adminMiddleware,
  authRouteRateLimit,
  validate(registerSchema),
  authController.createAdmin
)

export default router
