import express from 'express'
import orderController from '../controllers/order.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.middleware.js'
import { createOrderSchema } from '../validations/order.validation.js'

const router = express.Router()

router.post(
  '/',
  authMiddleware,
  validate(createOrderSchema),
  orderController.createOrder
)

router.get('/my', authMiddleware, orderController.getMyOrders)

router.get('/:id', authMiddleware, orderController.getOrderById)

router.post('/:id/cancel', authMiddleware, orderController.cancelOrder)

export default router
