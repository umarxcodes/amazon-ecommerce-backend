import asyncHandler from 'express-async-handler'
import { createAppError } from '../utils/app-error.util.js'
/*FILE: admin.middleware.js
========================================
*/
/* ===== ADMIN AUTHORIZATION MIDDLEWARE ===== */

const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    throw createAppError('Admin access only', 403)
  }
})

export default adminMiddleware
