import {
  validateOrderForCheckout,
  createCheckoutSession,
  confirmCheckoutSession,
} from '../services/payment.service.js'
import { asyncHandler } from '../utils/async-handler.util.js'

const checkout = asyncHandler(async (req, res) => {
  const { orderId } = req.body

  const order = await validateOrderForCheckout(orderId, req.user)

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

const confirmCheckout = asyncHandler(async (req, res) => {
  const { orderId, sessionId } = req.body

  const response = await confirmCheckoutSession({
    orderId,
    sessionId,
    user: req.user,
  })

  res.status(200).json(response)
})

export default {
  checkout,
  confirmCheckout,
}
