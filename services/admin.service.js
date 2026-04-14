import mongoose from 'mongoose'
import User from '../models/user.model.js'
import { createAdminUser } from './auth.service.js'
import { createAppError } from '../utils/app-error.util.js'

export const createAdmin = async (payload) => {
  return createAdminUser(payload)
}

export const getAllUsers = async () => {
  const users = await User.find().select('-password')

  return {
    success: true,
    count: users.length,
    data: users,
  }
}

export const changeUserRole = async ({ actorUserId, targetUserId, role }) => {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw createAppError('Invalid user ID', 400)
  }

  if (actorUserId === targetUserId) {
    throw createAppError('You cannot change your own role', 400)
  }

  const allowedRoles = ['USER', 'ADMIN']
  if (!allowedRoles.includes(role)) {
    throw createAppError('Invalid role', 400)
  }

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { role },
    { new: true }
  ).select('-password')

  if (!user) {
    throw createAppError('User not found', 404)
  }

  return {
    success: true,
    message: 'User role updated',
    data: user,
  }
}

export const deactivateUser = async (targetUserId) => {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw createAppError('Invalid user ID', 400)
  }

  const user = await User.findById(targetUserId)

  if (!user) {
    throw createAppError('User not found', 404)
  }

  if (!user.isActive) {
    throw createAppError('User already inactive', 400)
  }

  user.isActive = false
  await user.save()

  return {
    success: true,
    message: 'User deactivated successfully',
    data: user,
  }
}
