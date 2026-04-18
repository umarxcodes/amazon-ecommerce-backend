import stripe from '../config/stripe.config.js'
import Order from '../models/order.model.js'
import {
  env,
  isStripeWebhookConfigured,
} from '../config/env.config.js'
import { markOrderPaidFromSession } from '../services/payment.service.js'

const stripeWebhook = async (req, res) => {
  if (!isStripeWebhookConfigured() || !stripe) {
    return res.status(500).json({
      success: false,
      message: 'Stripe webhook is not configured',
    })
  }

  const sig = req.headers['stripe-signature']

  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.stripeWebhookSecret
    )
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const orderId = session.metadata?.orderId

      if (orderId) {
        const existingOrder = await Order.findById(orderId)

        if (existingOrder?.paymentResult?.sessionId === session.id) {
          return res.status(200).json({ received: true })
        }

        if (existingOrder && existingOrder.status !== 'cancelled') {
          await markOrderPaidFromSession({ order: existingOrder, session })
        }
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
    })
  }

  res.status(200).json({ received: true })
}

export default stripeWebhook
