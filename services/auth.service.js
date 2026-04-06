/*
📁 FILE: auth.service.js
📌 PURPOSE: Implements authentication business rules including normalization,
credential checks, account creation, and token generation.
========================================
*/

import User from '../models/user.model.js'
import { hashPassword, comparePassword } from '../utils/hash.util.js'
import { generateAccessToken } from '../utils/jwt.util.js'
import { createAppError } from '../utils/app-error.util.js'

/* ===== INPUT NORMALIZATION HELPERS ===== */
/* Shared helpers keep auth validation rules consistent between flows. */
const normalizeRequiredString = (value, fieldName) => {
  if (typeof value !== 'string') {
    throw createAppError(`${fieldName} must be a string`, 400)
  }

  const normalizedValue = value.trim()
  if (!normalizedValue) {
    throw createAppError(`${fieldName} is required`, 400)
  }

  return normalizedValue
}

const normalizeEmail = (email) =>
  normalizeRequiredString(email, 'Email').toLowerCase()

const normalizePassword = (password) => {
  if (typeof password !== 'string') {
    throw createAppError('Password must be a string', 400)
  }

  if (password.length < 6 || password.length > 50) {
    throw createAppError('Password must be between 6 and 50 characters', 400)
  }

  return password
}

const toSafeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
})

/* ===== USER CREATION HELPER ===== */
/* Centralizes duplicate account creation logic for users and admins. */
const createUser = async ({ name, email, password, role }) => {
  const normalizedEmail = normalizeEmail(email)
  const normalizedName = normalizeRequiredString(name, 'Name')
  const normalizedPassword = normalizePassword(password)
  const hashedPassword = await hashPassword(normalizedPassword)

  try {
    return await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    })
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.email) {
      throw createAppError('User already exists', 409)
    }

    throw error
  }
}

/* ===== REGISTER USER FUNCTION ===== */
/* Creates a regular user account and returns a response without secrets. */
export const registerUser = async ({ name, email, password }) => {
  const user = await createUser({ name, email, password, role: 'USER' })

  return {
    success: true,
    message: 'User registered successfully',
    data: toSafeUser(user),
  }
}

/* ===== CREATE ADMIN USER FUNCTION ===== */
/* Creates an administrator account using the shared creation workflow. */
export const createAdminUser = async ({ name, email, password }) => {
  const admin = await createUser({ name, email, password, role: 'ADMIN' })

  return {
    success: true,
    message: 'Admin created successfully',
    data: toSafeUser(admin),
  }
}

/* ===== LOGIN USER FUNCTION ===== */
/* Verifies credentials and returns an access token for active users. */
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email)
  const normalizedPassword = normalizePassword(password)
  const user = await User.findOne({
    email: normalizedEmail,
    isActive: true,
  }).select('+password')

  if (!user) {
    throw createAppError('Invalid credentials', 401)
  }

  const isMatch = await comparePassword(normalizedPassword, user.password)
  if (!isMatch) {
    throw createAppError('Invalid credentials', 401)
  }

  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    role: user.role,
  })

  return {
    success: true,
    message: 'Login successful',
    data: {
      accessToken,
      user: toSafeUser(user),
    },
  }
}
