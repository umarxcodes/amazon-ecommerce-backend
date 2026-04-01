/* =====*** IMPORTS ***===== */
import express from 'express'
import orderController from '../controllers/order.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = express.Router()

/* ================= ORDER ROUTES ================= */

// Create order (from cart)
router.post('/', authMiddleware, orderController.createOrder)

// Get logged-in user orders
router.get('/my', authMiddleware, orderController.getMyOrders)

// Get single order
router.get('/:id', authMiddleware, orderController.getOrderById)

export default router
