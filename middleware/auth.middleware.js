/*
📁 FILE: auth.middleware.js
📌 PURPOSE: Authenticates bearer tokens, loads the active user context, and
attaches authorization data to the request object.
========================================
*/

/* ===== IMPORTS ===== */
import jwt from 'jsonwebtoken'
import { env } from '../config/env.config.js'
import User from '../models/user.model.js'
import { createAppError } from '../utils/app-error.util.js'
import { asyncHandler } from '../utils/async-handler.util.js'

/* ===== AUTH MIDDLEWARE ===== */
/* Verifies JWT access tokens and exposes the authenticated user on req.user. */

const authMiddleware = asyncHandler(async (req, res, next) => {
  /* =====*** GET TOKEN FROM HEADER ***===== */
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createAppError('Not authorized, token missing', 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    /* =====*** VERIFY TOKEN ***===== */
    const decoded = jwt.verify(token, env.jwtSecret)

    const user = await User.findOne({
      _id: decoded.userId,
      isActive: true,
    })
      .select('_id role')
      .lean()

    if (!user) {
      throw createAppError('User no longer has access', 401)
    }

    /* =====*** ATTACH USER DATA TO REQUEST ***===== */
    req.user = {
      userId: user._id.toString(),
      role: user.role,
    }

    next()
  } catch (error) {
    // If it's already an AppError with statusCode, re-throw it
    if (error.statusCode) {
      throw error
    }

    // Handle JWT-specific errors (expired, invalid, etc.)
    if (error.name === 'TokenExpiredError') {
      throw createAppError('Token expired', 401)
    }

    if (error.name === 'JsonWebTokenError') {
      throw createAppError('Invalid token', 401)
    }

    // Default: token is invalid or malformed
    throw createAppError('Not authorized, token invalid', 401)
  }
})

export default authMiddleware
