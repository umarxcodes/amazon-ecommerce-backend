import asyncHandler from 'express-async-handler'
import { createAppError } from '../utils/app-error.util.js'

const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next()
  } else {
    throw createAppError('Admin access only', 403)
  }
})

export default adminMiddleware
