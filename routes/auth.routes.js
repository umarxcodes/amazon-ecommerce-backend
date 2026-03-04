/* =====*** IMPORTS ***===== */
import express from 'express'
import authController from '../controllers/auth.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import adminMiddleware from '../middleware/admin.middleware.js'

const router = express.Router()

/* ================================* PUBLIC ROUTES *=============================== */
router.post('/register', authController.register)
router.post('/login', authController.login)

/* ================================* ADMIN CREATE USER *=============================== */
router.post(
  '/admin-create',
  authMiddleware,
  adminMiddleware,
  authController.register
)

export default router
