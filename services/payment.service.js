import mongoose from 'mongoose'
import stripe from '../config/stripe.config.js'
import Order from '../models/order.model.js'
import {
  env,
  isStripeCheckoutConfigured,
  isStripeSecretConfigured,
} from '../config/env.config.js'
import { createAppError } from '../utils/app-error.util.js'

const getAuthorizedOrder = async (orderId, user) => {
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
      'Not authorized to access payment for this order',
      403
    )
  }

  return order
}

const buildPaymentResult = (session) => ({
  id: session.payment_intent || '',
  status: session.payment_status || 'paid',
  emailAddress: session.customer_details?.email || '',
  sessionId: session.id,
  updatedAt: new Date(),
})

export const markOrderPaidFromSession = async ({ order, session }) => {
  if (order.isPaid && order.paymentResult?.sessionId === session.id) {
    return order
  }

  order.isPaid = true
  order.paidAt = new Date()
  order.status = 'paid'
  order.paymentResult = buildPaymentResult(session)
  await order.save()

  return order
}

export const validateOrderForCheckout = async (orderId, user) => {
  const order = await getAuthorizedOrder(orderId, user)

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
  if (!isStripeCheckoutConfigured() || !stripe) {
    throw createAppError(
      'Stripe checkout is not fully configured. Set CLIENT_URL and STRIPE_SECRET_KEY.',
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
    success_url: `${env.clientUrl}/payment/return/${order._id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.clientUrl}/payment/return/${order._id}?canceled=true`,
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    metadata: {
      orderId: order._id.toString(),
    },
  })
}

export const confirmCheckoutSession = async ({ orderId, sessionId, user }) => {
  if (!sessionId?.trim()) {
    throw createAppError('Stripe session ID is required', 400)
  }

  if (!isStripeSecretConfigured() || !stripe) {
    throw createAppError(
      'Stripe is not configured. Set STRIPE_SECRET_KEY.',
      500
    )
  }

  const order = await getAuthorizedOrder(orderId, user)

  if (order.status === 'cancelled') {
    throw createAppError('Order has been cancelled', 400)
  }

  if (order.isPaid) {
    return {
      success: true,
      message: 'Order already marked as paid',
      order,
    }
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId.trim())

  if (!session || session.metadata?.orderId !== order._id.toString()) {
    throw createAppError('This Stripe session does not match the order', 400)
  }

  if (session.payment_status !== 'paid') {
    throw createAppError(
      'Payment has not completed yet. Please try again after Stripe finishes processing.',
      400
    )
  }

  const updatedOrder = await markOrderPaidFromSession({ order, session })

  return {
    success: true,
    message: 'Payment confirmed successfully',
    order: updatedOrder,
  }
}
