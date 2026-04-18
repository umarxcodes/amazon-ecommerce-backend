import dotenv from 'dotenv'

dotenv.config()

const requiredEnvKeys = ['MONGO_URI', 'JWT_SECRET']

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  trustProxy: process.env.TRUST_PROXY || '1',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  clientUrl: process.env.CLIENT_URL,
  corsOrigins: process.env.CORS_ORIGINS,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL,
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  disableRedis: process.env.DISABLE_REDIS === 'true',
}

const DEFAULT_DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
]

export const validateEnv = () => {
  const missing = requiredEnvKeys.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }
}

export const isStripeConfigured = () => {
  return Boolean(
    env.clientUrl && env.stripeSecretKey && env.stripeWebhookSecret
  )
}

export const isStripeCheckoutConfigured = () => {
  return Boolean(env.clientUrl && env.stripeSecretKey)
}

export const isStripeSecretConfigured = () => {
  return Boolean(env.stripeSecretKey)
}

export const isStripeWebhookConfigured = () => {
  return Boolean(env.stripeSecretKey && env.stripeWebhookSecret)
}

export const isRedisConfigured = () => {
  if (env.disableRedis) {
    return false
  }

  return Boolean(env.upstashRedisRestUrl && env.upstashRedisRestToken)
}

export const isCloudinaryConfigured = () => {
  return Boolean(
    env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret
  )
}

export const getCorsOrigins = () => {
  const configuredOrigins = env.corsOrigins
    ? env.corsOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : env.clientUrl
      ? [env.clientUrl]
      : []

  if (env.nodeEnv === 'production') {
    return configuredOrigins
  }

  return [...new Set([...DEFAULT_DEV_ORIGINS, ...configuredOrigins])]
}
