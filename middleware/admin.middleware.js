import asyncHandler from 'express-async-handler'
import { createAppError } from '../utils/app-error.util.js'
/*FILE: admin.middleware.js
========================================
*/
/* ===== ADMIN AUTHORIZATION MIDDLEWARE ===== */
/* Grants access only to users with ADMIN role. */

const adminMiddleware = asyncHandler(async (req, res, next) => {
  // Ensure user is authenticated and has admin privileges
  if (!req.user) {
    console.error(
      '[Admin Middleware] No user found in request - auth middleware may not have run'
    )
    throw createAppError('Authentication required', 401)
  }

  // CRITICAL: Role is stored as 'ADMIN' (uppercase) in the database
  if (req.user.role === 'ADMIN') {
    return next()
  }

  // Log unauthorized admin access attempts for security monitoring
  console.warn(
    `[Security] Non-admin user ${req.user.userId} (${req.user.role}) attempted admin access from ${req.ip}`
  )

  throw createAppError('Admin access only', 403)
})

export default adminMiddleware
