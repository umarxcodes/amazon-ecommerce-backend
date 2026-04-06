/*
========================================
*/

/* ===== GLOBAL ERROR HANDLER ===== */
const errorHandler = (err, req, res, next) => {
  let statusCode =
    err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode)
  let message = err.message || 'Internal server error'
  let details = err.details || null

  /* =====*** MONGODB INVALID OBJECT ID ***===== */
  if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
  }

  /* =====*** MONGODB DUPLICATE KEY ERROR ***===== */
  if (err.code === 11000) {
    statusCode = 400
    message = 'Duplicate field value entered'
  }

  /* =====*** MONGOOSE VALIDATION ERROR ***===== */
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation failed'
    details = Object.values(err.errors).map((error) => error.message)
  }

  /* =====*** JWT ERROR ***===== */
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }

  /* =====*** JWT EXPIRED ***===== */
  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  }

  if (err.name === 'MulterError') {
    statusCode = 400
    message = err.message
  }

  /* =====*** RESPONSE ***===== */
  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    details,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  })
}

export default errorHandler
