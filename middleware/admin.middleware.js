/* =====*** IMPORTS ***===== */
import asyncHandler from 'express-async-handler'

/* =====*** ADMIN MIDDLEWARE ***===== */
const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next()
  } else {
    res.status(403)
    throw new Error('Access denied, admin only')
  }
})

export default adminMiddleware
