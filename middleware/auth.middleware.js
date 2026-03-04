/* =====*** IMPORTS ***===== */
import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/user.model.js'

/* =====*** AUTH MIDDLEWARE ***===== */
const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401)
    throw new Error('Not authorized, token missing')
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.userId)
    next()
  } catch (error) {
    res.status(401)
    throw new Error('Not authorized, token invalid')
  }
})

export default authMiddleware
