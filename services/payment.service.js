/*
📁 FILE: payment.service.js
📌 PURPOSE: Builds Stripe checkout sessions from internal order data while
ensuring required payment configuration is present.
========================================
*/

import stripe from '../config/stripe.config.js'
import { env, isStripeConfigured } from '../config/env.config.js'
import { createAppError } from '../utils/app-error.util.js'

/* ===== CREATE CHECKOUT SESSION FUNCTION ===== */
/* Maps order items to Stripe line items and creates a hosted checkout session. */
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
    success_url: `${env.clientUrl}/success?orderId=${order._id}`,
    cancel_url: `${env.clientUrl}/cancel?orderId=${order._id}`,
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    metadata: {
      orderId: order._id.toString(),
    },
  })
}
