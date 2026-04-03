import { env, getCorsOrigins } from '../config/env.config.js'

const allowedOrigins = new Set(getCorsOrigins())

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.size === 0 || allowedOrigins.has(origin)) {
      return callback(null, true)
    }

    return callback(new Error('CORS origin not allowed'))
  },
  credentials: true,
}

export const applyAppSecurity = (app) => {
  app.disable('x-powered-by')

  if (env.trustProxy !== 'false') {
    const proxyValue = Number(env.trustProxy)
    app.set('trust proxy', Number.isNaN(proxyValue) ? env.trustProxy : proxyValue)
  }

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('X-XSS-Protection', '0')
    next()
  })
}
