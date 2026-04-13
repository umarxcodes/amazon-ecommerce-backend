import stripe from '../config/stripe.config.js'
import Order from '../models/order.model.js'
import { env, isStripeConfigured } from '../config/env.config.js'

const stripeWebhook = async (req, res) => {
  if (!isStripeConfigured() || !stripe) {
    return res.status(500).json({
      success: false,
      message: 'Stripe is not configured',
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

  /* ===== HANDLE EVENT ===== */
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const orderId = session.metadata?.orderId

      if (orderId) {
        await Order.findOneAndUpdate(
          { _id: orderId, isPaid: false, status: 'pending' },
          {
            $set: {
              isPaid: true,
              paidAt: new Date(),
              status: 'paid',
              paymentResult: {
                id: session.payment_intent || '',
                status: session.payment_status || 'paid',
                emailAddress: session.customer_details?.email || '',
                sessionId: session.id,
                updatedAt: new Date(),
              },
            },
          }
        )
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
