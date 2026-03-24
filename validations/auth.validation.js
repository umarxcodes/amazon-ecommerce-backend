import * as yup from 'yup'

export const registerSchema = yup.object({
  name: yup.string().trim().min(3).max(50).required(),
  email: yup.string().trim().lowercase().email().required(),
  password: yup.string().trim().min(6).max(50).required(),
})

export const loginSchema = yup.object({
  email: yup.string().trim().lowercase().email().required(),
  password: yup.string().trim().min(6).max(50).required(),
})
