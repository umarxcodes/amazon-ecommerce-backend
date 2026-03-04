/* ======*IMPORTS*====== */
import * as yup from 'yup'

/* ======*PRODUCT VALIDATION SCHEMA*====== */
export const productValidationSchema = yup.object({
  name: yup.string().required(),
  description: yup.string().required(),
  price: yup.number().required().positive(),
  category: yup.string().required(),
  stock: yup.number().min(0),
  images: yup.array().of(yup.string()),
})
