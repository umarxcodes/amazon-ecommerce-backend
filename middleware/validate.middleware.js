/*
📁 FILE: validate.middleware.js
📌 PURPOSE: Applies Yup schemas to incoming request bodies and converts
validation failures into application errors.
========================================
*/

import { createAppError } from '../utils/app-error.util.js'

/* ===== VALIDATION MIDDLEWARE ===== */
/* Validates req.body, strips unknown fields, and forwards a standard error. */
const validate = (schema) => async (req, res, next) => {
  try {
    // =====*** Validate request body against Yup schema ***=====
    const validatedBody = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    req.body = validatedBody

    next()
  } catch (err) {
    return next(createAppError('Validation failed', 400, err.errors))
  }
}

export default validate
