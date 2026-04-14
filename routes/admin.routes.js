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

router.post(
  '/create-admin',
  authMiddleware,
  adminMiddleware,
  adminRateLimit,
  validate(createAdminSchema),
  adminController.createAdmin
)

router.get(
  '/users',
  authMiddleware,
  adminMiddleware,
  adminRateLimit,
  adminController.getAllUsers
)

router.patch(
  '/users/:id/role',
  authMiddleware,
  adminMiddleware,
  adminRateLimit,
  validate(changeUserRoleSchema),
  adminController.changeUserRole
)

router.patch(
  '/users/:id/deactivate',
  authMiddleware,
  adminMiddleware,
  adminRateLimit,
  adminController.deactivateUser
)

export default router
