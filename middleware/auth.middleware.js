/* =====*** IMPORTS ***===== */
import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'

/* ================================* AUTH MIDDLEWARE *=============================== */

const authMiddleware = asyncHandler(async (req, res, next) => {
  /* =====*** GET TOKEN FROM HEADER ***===== */
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401)
    throw new Error('Not authorized, token missing')
  }

  const token = authHeader.split(' ')[1]

  try {
    /* =====*** VERIFY TOKEN ***===== */
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    /* =====*** ATTACH USER DATA TO REQUEST ***===== */
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    }

    next()
  } catch (error) {
    res.status(401)
    throw new Error('Not authorized, token invalid')
  }
})

export default authMiddleware
