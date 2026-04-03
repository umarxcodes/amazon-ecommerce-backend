import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import Order from '../models/order.model.js'
import { createAppError } from '../utils/app-error.util.js'
import { createCheckoutSession } from '../services/payment.service.js'

/* ================= CREATE CHECKOUT ================= */
const checkout = asyncHandler(async (req, res) => {
  const { orderId } = req.body

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw createAppError('Invalid order ID', 400)
  }

  const order = await Order.findById(orderId).populate('user', 'email')

  if (!order) {
    throw createAppError('Order not found', 404)
  }

  const isOwner = order.user._id.toString() === req.user.userId
  const isAdmin = req.user.role === 'ADMIN'

  if (!isOwner && !isAdmin) {
    throw createAppError('Not authorized to create checkout for this order', 403)
  }

  if (!order.items.length) {
    throw createAppError('Order has no items', 400)
  }

  if (order.isPaid) {
    throw createAppError('Order already paid', 400)
  }

  /* ===== CREATE STRIPE SESSION ===== */
  const session = await createCheckoutSession({
    order,
    customerEmail: order.user?.email,
  })

  res.status(200).json({
    success: true,
    sessionId: session.id,
    url: session.url,
  })
})

export default {
  checkout,
}
