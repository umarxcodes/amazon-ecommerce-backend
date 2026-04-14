import { createAppError } from '../utils/app-error.util.js'
import { asyncHandler } from '../utils/async-handler.util.js'

const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw createAppError('Authentication required', 401)
  }

  if (req.user.role === 'ADMIN') {
    return next()
  }

  throw createAppError('Admin access only', 403)
})

export default adminMiddleware
