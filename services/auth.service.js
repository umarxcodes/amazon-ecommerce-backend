import User from '../models/user.model.js'
import { hashPassword, comparePassword } from '../utils/hash.util.js'
import { generateAccessToken } from '../utils/jwt.util.js'
import { createAppError } from '../utils/app-error.util.js'

const toSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
})

const createUser = async ({ name, email, password, role }) => {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedName = name.trim()
  const existingUser = await User.findOne({ email: normalizedEmail })
  if (existingUser) {
    throw createAppError('User already exists', 409)
  }

  const hashedPassword = await hashPassword(password)

  return User.create({
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
    role,
  })
}

export const registerUser = async ({ name, email, password }) => {
  const totalUsers = await User.countDocuments()
  const role = totalUsers === 0 ? 'ADMIN' : 'USER'
  const user = await createUser({ name, email, password, role })

  return {
    success: true,
    message: 'User registered successfully',
    data: toSafeUser(user),
  }
}

export const createAdminUser = async ({ name, email, password }) => {
  const admin = await createUser({ name, email, password, role: 'ADMIN' })

  return {
    success: true,
    message: 'Admin created successfully',
    data: toSafeUser(admin),
  }
}

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await User.findOne({
    email: normalizedEmail,
    isActive: true,
  }).select('+password')

  if (!user) {
    throw createAppError('Invalid credentials', 401)
  }

  const isMatch = await comparePassword(password, user.password)
  if (!isMatch) {
    throw createAppError('Invalid credentials', 401)
  }

  const accessToken = generateAccessToken({
    userId: user._id,
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
