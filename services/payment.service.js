import mongoose from 'mongoose'
import stripe from '../config/stripe.config.js'
import Order from '../models/order.model.js'
import { env, isStripeConfigured } from '../config/env.config.js'
import { createAppError } from '../utils/app-error.util.js'

export const validateOrderForCheckout = async (orderId, user) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw createAppError('Invalid order ID', 400)
  }

  const order = await Order.findById(orderId).populate('user', 'email')

  if (!order) {
    throw createAppError('Order not found', 404)
  }

  const isOwner = order.user._id.toString() === user.userId
  const isAdmin = user.role === 'ADMIN'

  if (!isOwner && !isAdmin) {
    throw createAppError(
      'Not authorized to create checkout for this order',
      403
    )
  }

  if (!order.items.length) {
    throw createAppError('Order has no items', 400)
  }

  if (order.isPaid) {
    throw createAppError('Order already paid', 400)
  }

  if (order.status === 'cancelled') {
    throw createAppError('Order has been cancelled', 400)
  }

  if (order.expiresAt && order.expiresAt < new Date()) {
    throw createAppError('Order has expired. Please create a new order.', 400)
  }

  return order
}

export const createCheckoutSession = async ({ order, customerEmail }) => {
  if (!isStripeConfigured() || !stripe) {
    throw createAppError(
      'Stripe is not fully configured. Set CLIENT_URL, STRIPE_SECRET_KEY, and STRIPE_WEBHOOK_SECRET.',
      500
    )
  }

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        ...(item.image ? { images: [item.image] } : {}),
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }))

  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${env.clientUrl}/payment/return/${order._id}`,
    cancel_url: `${env.clientUrl}/payment/return/${order._id}?canceled=true`,
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    metadata: {
      orderId: order._id.toString(),
    },
  })
}
