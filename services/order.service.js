/*
📁 FILE: order.service.js
📌 PURPOSE: Creates orders from carts, performs stock mutation inside a
transaction, and exposes order retrieval methods.
========================================
*/

import mongoose from 'mongoose'
import Order from '../models/order.model.js'
import Cart from '../models/cart.model.js'
import Product from '../models/product.model.js'
import { clearCartCache, clearProductCache } from './cache.service.js'
import { createAppError } from '../utils/app-error.util.js'

/* ===== CREATE ORDER FUNCTION ===== */
/* Converts the cart into an order snapshot and deducts stock transactionally. */
export const createOrder = async ({ userId, shippingAddress }) => {
  const session = await mongoose.startSession()

  try {
    let createdOrder

    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ user: userId })
        .populate('items.product')
        .session(session)

      if (!cart || cart.items.length === 0) {
        throw createAppError('Cart is empty', 400)
      }

      const missingProductItem = cart.items.find((item) => !item.product)
      if (missingProductItem) {
        throw createAppError(
          'Cart contains an unavailable product. Remove it and try again.',
          400
        )
      }

      const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        image: item.product.images[0] || '',
      }))

      const totalPrice = orderItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      )

      for (const item of cart.items) {
        const product = await Product.findById(item.product._id).session(
          session
        )

        if (!product || product.stock < item.quantity) {
          throw createAppError(`Not enough stock for ${product?.name}`, 400)
        }

        product.stock -= item.quantity
        await product.save({ session })
      }

      const [order] = await Order.create(
        [
          {
            user: userId,
            items: orderItems,
            shippingAddress,
            totalPrice,
          },
        ],
        { session }
      )

      cart.items = []
      cart.totalPrice = 0
      await cart.save({ session })

      createdOrder = order
    })

    await clearCartCache(userId)
    await clearProductCache()

    return {
      success: true,
      message: 'Order created successfully',
      order: createdOrder,
    }
  } finally {
    await session.endSession()
  }
}

/* ===== GET MY ORDERS FUNCTION ===== */
/* Returns all orders for the authenticated user. */
export const getMyOrders = async (userId) => {
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 })

  return {
    success: true,
    count: orders.length,
    orders,
  }
}

/* ===== GET ORDER BY ID FUNCTION ===== */
/* Returns one order after ownership or admin-access verification. */
export const getOrderById = async ({ orderId, userId, role }) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw createAppError('Invalid order ID', 400)
  }

  const order = await Order.findById(orderId).populate('user', 'name email')

  if (!order) {
    throw createAppError('Order not found', 404)
  }

  const isOwner = order.user._id.toString() === userId
  const isAdmin = role === 'ADMIN'

  if (!isOwner && !isAdmin) {
    throw createAppError('Not authorized to view this order', 403)
  }

  return {
    success: true,
    order,
  }
}

/* ===== CANCEL ORDER FUNCTION ===== */
/* Cancels an unpaid pending order and restores deducted stock. */
export const cancelOrder = async ({ orderId, userId, role }) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw createAppError('Invalid order ID', 400)
  }

  const session = await mongoose.startSession()

  try {
    let cancelledOrder

    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: orderId,
        user: userId,
        status: 'pending',
        isPaid: false,
      }).session(session)

      if (!order) {
        throw createAppError(
          'Order not found, already paid, already cancelled, or not yours',
          404
        )
      }

      // Restore stock for each order item
      for (const item of order.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } },
            { session }
          )
        }
      }

      order.status = 'cancelled'
      await order.save({ session })

      cancelledOrder = order
    })

    await clearProductCache()

    return {
      success: true,
      message: 'Order cancelled and stock restored',
      order: cancelledOrder,
    }
  } finally {
    await session.endSession()
  }
}
