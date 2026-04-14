import { createAppError } from '../utils/app-error.util.js'

const validate = (schema) => async (req, res, next) => {
  try {
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
