import express from 'express'
import adminController from '../controllers/admin.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import adminMiddleware from '../middleware/admin.middleware.js'
import validate from '../middleware/validate.middleware.js'
import { adminRateLimit } from '../middleware/rate-limit.middleware.js'
import {
  createAdminSchema,
  changeUserRoleSchema,
} from '../validations/admin.validation.js'

const router = express.Router()

/* ================= ADMIN ROUTES ================= */

// Create new admin
router.post(
  '/create-admin',
  authMiddleware,
  adminMiddleware,
  adminRateLimit,
  validate(createAdminSchema),
  adminController.createAdmin
)

// Get all users
router.get(
  '/users',
  authMiddleware,
  adminMiddleware,
  adminRateLimit,
  adminController.getAllUsers
)

// Change user role
router.patch(
  '/users/:id/role',
  authMiddleware,
  adminMiddleware,
  adminRateLimit,
  validate(changeUserRoleSchema),
  adminController.changeUserRole
)

// Deactivate user
router.patch(
  '/users/:id/deactivate',
  authMiddleware,
  adminMiddleware,
  adminRateLimit,
  adminController.deactivateUser
)

export default router
