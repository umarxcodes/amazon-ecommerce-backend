import * as yup from 'yup'

export const registerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .required('Name is required'),

  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Invalid email format')
    .required('Email is required'),

  password: yup
    .string()
    .trim()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password cannot exceed 50 characters')
    .required('Password is required'),
})

// ================================* LOGIN SCHEMA *============================

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Invalid email format')
    .required('Email is required'),

  password: yup
    .string()
    .trim()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password cannot exceed 50 characters')
    .required('Password is required'),
})
