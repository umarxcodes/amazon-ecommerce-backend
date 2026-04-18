import helmet from 'helmet'
import { env, getCorsOrigins } from '../config/env.config.js'
import { createAppError } from '../utils/app-error.util.js'

const allowedOrigins = new Set(getCorsOrigins())

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.size === 0 || allowedOrigins.has(origin)) {
      return callback(null, true)
    }

    return callback(createAppError('CORS origin not allowed', 403))
  },
  credentials: true,
}

export const applyAppSecurity = (app) => {
  app.disable('x-powered-by')

  if (env.trustProxy !== 'false') {
    const proxyValue = Number(env.trustProxy)
    app.set(
      'trust proxy',
      Number.isNaN(proxyValue) ? env.trustProxy : proxyValue
    )
  }

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  )
}
