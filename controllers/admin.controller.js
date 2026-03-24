import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import User from '../models/user.model.js'
import { hashPassword } from '../utils/hash.util.js'

/* ================= CREATE ADMIN ================= */
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    res.status(400)
    throw new Error('All fields are required')
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    res.status(409)
    throw new Error('User already exists')
  }

  const hashedPassword = await hashPassword(password)

  const admin = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'ADMIN',
  })

  res.status(201).json({
    success: true,
    message: 'Admin created successfully',
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  })
})

/* ================= GET ALL USERS ================= */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password')

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  })
})

/* ================= CHANGE USER ROLE ================= */
const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400)
    throw new Error('Invalid user ID')
  }

  if (!role || !['USER', 'ADMIN'].includes(role)) {
    res.status(400)
    throw new Error('Invalid role')
  }

  if (req.user.userId === req.params.id) {
    res.status(400)
    throw new Error('You cannot change your own role')
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password')

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  res.status(200).json({
    success: true,
    message: 'User role updated',
    data: user,
  })
})

/* ================= DEACTIVATE USER ================= */
const deactivateUser = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400)
    throw new Error('Invalid user ID')
  }

  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  if (!user.isActive) {
    res.status(400)
    throw new Error('User already inactive')
  }

  user.isActive = false
  await user.save()

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully',
    data: user,
  })
})

export default {
  createAdmin,
  getAllUsers,
  changeUserRole,
  deactivateUser,
}
