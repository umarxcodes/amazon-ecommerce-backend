import * as yup from 'yup'

export const createOrderSchema = yup.object({
  shippingAddress: yup
    .object({
      address: yup.string().trim().max(200).required(),
      city: yup.string().trim().max(100).required(),
      postalCode: yup.string().trim().max(20).required(),
      country: yup.string().trim().max(100).required(),
    })
    .required(),
})
