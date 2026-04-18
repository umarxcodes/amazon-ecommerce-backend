import * as yup from 'yup'

export const checkoutSchema = yup.object({
  orderId: yup.string().trim().required(),
})

export const confirmCheckoutSchema = yup.object({
  orderId: yup.string().trim().required(),
  sessionId: yup.string().trim().required(),
})
