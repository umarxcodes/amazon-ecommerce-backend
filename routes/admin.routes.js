import express from 'express'
import adminController from '../controllers/admin.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import adminMiddleware from '../middleware/admin.middleware.js'

const router = express.Router()

/* ================= ADMIN ROUTES ================= */

// Create new admin
router.post(
  '/create-admin',
  authMiddleware,
  adminMiddleware,
  adminController.createAdmin
)

// Get all users
router.get(
  '/users',
  authMiddleware,
  adminMiddleware,
  adminController.getAllUsers
)

// Change user role
router.patch(
  '/users/:id/role',
  authMiddleware,
  adminMiddleware,
  adminController.changeUserRole
)

// Deactivate user
router.patch(
  '/users/:id/deactivate',
  authMiddleware,
  adminMiddleware,
  adminController.deactivateUser
)

export default router
