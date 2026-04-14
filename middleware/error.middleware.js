const errorHandler = (err, req, res, next) => {
  let statusCode =
    err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode)
  let message = err.message || 'Internal server error'
  let details = err.details || null

  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error] ${err.name}: ${err.message}`)
    if (err.stack) {
      console.error(err.stack)
    }
  }

  if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
  }

  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyPattern || {})[0]
    message = field ? `${field} already exists` : 'Duplicate value entered'
  }

  if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation failed'
    details = Object.values(err.errors).map((error) => error.message)
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  }

  if (err.name === 'MulterError') {
    statusCode = 400
    message = err.message
  }

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    details,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  })
}

export default errorHandler
