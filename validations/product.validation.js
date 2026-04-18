import * as yup from 'yup'
import { PRODUCT_CATEGORIES } from '../constants/product-categories.js'

export const productValidationSchema = yup.object({
  name: yup.string().required(),
  description: yup.string().required(),
  price: yup.number().required().positive(),
  category: yup
    .string()
    .trim()
    .oneOf(PRODUCT_CATEGORIES, 'Please choose a valid product category')
    .required(),
  stock: yup.number().min(0).default(0),
  rating: yup.number().min(0).max(5),
  ratings: yup.number().min(0).max(5),
  images: yup.array().of(yup.string().url()),
})

export const updateProductValidationSchema = yup.object({
  name: yup.string(),
  description: yup.string(),
  price: yup.number().positive(),
  category: yup
    .string()
    .trim()
    .oneOf(PRODUCT_CATEGORIES, 'Please choose a valid product category'),
  stock: yup.number().min(0),
  rating: yup.number().min(0).max(5),
  ratings: yup.number().min(0).max(5),
  images: yup.array().of(yup.string().url()),
})
