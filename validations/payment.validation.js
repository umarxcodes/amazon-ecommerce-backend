import * as yup from 'yup'

export const checkoutSchema = yup.object({
  orderId: yup.string().trim().required(),
})
