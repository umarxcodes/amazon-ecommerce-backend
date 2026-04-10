/*
📁 FILE: async-handler.util.js
📌 PURPOSE: Wraps async route handlers and middleware so rejected promises
are forwarded to the global error handler without repetitive try/catch blocks.
========================================
*/

/* ===== ASYNC HANDLER WRAPPER ===== */
/* Supports both route handlers (req, res, next) and middleware (req, res, next). */
export const asyncHandler = (handler) => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

export default asyncHandler
