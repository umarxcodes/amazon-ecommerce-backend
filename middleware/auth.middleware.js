/* =====*** IMPORTS ***===== */
import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import { env } from '../config/env.config.js'
import User from '../models/user.model.js'
import { createAppError } from '../utils/app-error.util.js'

/* ================================* AUTH MIDDLEWARE *=============================== */

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
    if (error.statusCode) {
      throw error
    }

    throw createAppError('Not authorized, token invalid', 401)
  }
})

export default authMiddleware
