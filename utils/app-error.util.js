export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.details = details
    this.isOperational = true
    Error.captureStackTrace?.(this, this.constructor)
  }
}

export const createAppError = (message, statusCode = 500, details = null) => {
  return new AppError(message, statusCode, details)
}
