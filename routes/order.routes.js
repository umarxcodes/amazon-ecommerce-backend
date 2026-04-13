/*
📁 FILE: order.routes.js
📌 PURPOSE: Declares authenticated order creation and retrieval endpoints.
========================================
*/

/* ===== IMPORTS ===== */
import express from 'express'
import orderController from '../controllers/order.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.middleware.js'
import { createOrderSchema } from '../validations/order.validation.js'

const router = express.Router()

/* ===== ORDER ROUTES ===== */
/* These routes create orders from carts and expose order history to users. */

// Create order (from cart)
router.post(
  '/',
  authMiddleware,
  validate(createOrderSchema),
  orderController.createOrder
)

// Get logged-in user orders
router.get('/my', authMiddleware, orderController.getMyOrders)

// Get single order
router.get('/:id', authMiddleware, orderController.getOrderById)

// Cancel unpaid pending order (restores stock)
router.post('/:id/cancel', authMiddleware, orderController.cancelOrder)

export default router
