import crypto from 'crypto'
import redis from '../config/redis.config.js'
import { createAppError } from '../utils/app-error.util.js'

const now = () => Date.now()

const sha1 = (value) =>
  crypto.createHash('sha1').update(String(value)).digest('hex')

const getIpAddress = (req) => {
  const forwarded = req.headers['x-forwarded-for']
  const forwardedIp = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(',')[0]?.trim()

  return forwardedIp || req.ip || req.socket?.remoteAddress || 'unknown'
}

const defaultHandler = ({ retryAfterSeconds }) =>
  createAppError(
    `Too many requests. Try again in ${Math.max(1, retryAfterSeconds)} second(s).`,
    429
  )

const incrementSlidingWindowCounter = async ({ key, windowMs }) => {
  const timestamp = now()
  const currentWindow = Math.floor(timestamp / windowMs)
  const currentWindowStart = currentWindow * windowMs
  const previousWindow = currentWindow - 1

  const currentWindowKey = `${key}:w:${currentWindow}`
  const previousWindowKey = `${key}:w:${previousWindow}`

  const [currentCountRaw, previousCountRaw] = await Promise.all([
    redis.incr(currentWindowKey),
    redis.get(previousWindowKey),
  ])

  // Keep two windows to support weighted sliding calculations.
  await redis.pexpire(currentWindowKey, windowMs * 2)

  const currentCount = Number(currentCountRaw || 0)
  const previousCount = Number(previousCountRaw || 0)
  const elapsedInCurrentWindow = timestamp - currentWindowStart
  const previousWindowWeight =
    (windowMs - elapsedInCurrentWindow) / Math.max(windowMs, 1)

  const weightedCurrent = currentCount + previousCount * previousWindowWeight

  return {
    current: weightedCurrent,
    resetAt: currentWindowStart + windowMs,
  }
}

const incrementCounter = async (config) => {
  if (!redis) {
    // Redis not configured - degrade gracefully by allowing the request
    return { current: 0, resetAt: Date.now() + config.windowMs }
  }

  return incrementSlidingWindowCounter(config)
}

const resolveKeys = async (req, descriptor) => {
  const values = await descriptor.key(req)

  if (!Array.isArray(values)) {
    return [values].filter(Boolean)
  }

  return values.filter(Boolean)
}

const setRateLimitHeaders = (
  res,
  { limit, current, resetAt, includeRetryAfter = false }
) => {
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now()) / 1000))
  const remaining = Math.max(Math.floor(limit - current), 0)

  res.setHeader('X-RateLimit-Limit', String(limit))
  res.setHeader('X-RateLimit-Remaining', String(remaining))
  res.setHeader('X-RateLimit-Reset', new Date(resetAt).toISOString())

  if (includeRetryAfter) {
    res.setHeader('Retry-After', String(retryAfterSeconds))
  }
}

export const createRateLimiter = ({
  namespace,
  windowMs,
  limit,
  key,
  handler = defaultHandler,
}) => {
  return async (req, res, next) => {
    try {
      const keys = await resolveKeys(req, { key })
      let mostConstrainedResult = null

      for (const rawKey of keys) {
        const storageKey = `rate-limit:${namespace}:${sha1(rawKey)}`
        const result = await incrementCounter({
          key: storageKey,
          windowMs,
        })

        if (
          !mostConstrainedResult ||
          result.current > mostConstrainedResult.current
        ) {
          mostConstrainedResult = result
        }

        if (result.current > limit) {
          setRateLimitHeaders(res, {
            limit,
            current: result.current,
            resetAt: result.resetAt,
            includeRetryAfter: true,
          })

          return next(
            handler({
              req,
              limit,
              current: result.current,
              retryAfterSeconds: Math.ceil((result.resetAt - now()) / 1000),
            })
          )
        }
      }

      if (mostConstrainedResult) {
        setRateLimitHeaders(res, {
          limit,
          current: mostConstrainedResult.current,
          resetAt: mostConstrainedResult.resetAt,
        })
      }

      return next()
    } catch (error) {
      if (redis) {
        console.error(
          `Rate limiter degraded for namespace "${namespace}": ${error.message}`
        )
      }

      return next()
    }
  }
}

export const publicApiRateLimit = createRateLimiter({
  namespace: 'public-api',
  windowMs: 60 * 1000,
  limit: 90,
  key: (req) => `ip:${getIpAddress(req)}`,
})

export const apiDdosRateLimit = createRateLimiter({
  namespace: 'ddos-global',
  windowMs: 10 * 1000,
  limit: 35,
  key: (req) => `ip:${getIpAddress(req)}`,
})

export const authRouteRateLimit = createRateLimiter({
  namespace: 'auth-route',
  windowMs: 15 * 60 * 1000,
  limit: 20,
  key: (req) => `ip:${getIpAddress(req)}`,
})

export const loginRateLimit = createRateLimiter({
  namespace: 'login',
  windowMs: 15 * 60 * 1000,
  limit: 5,
  key: (req) => {
    const normalizedEmail = req.body?.email?.trim()?.toLowerCase()

    return [
      `ip:${getIpAddress(req)}`,
      normalizedEmail ? `email:${normalizedEmail}` : null,
      normalizedEmail
        ? `ip-email:${getIpAddress(req)}:${normalizedEmail}`
        : null,
    ]
  },
})

export const checkoutRateLimit = createRateLimiter({
  namespace: 'checkout',
  windowMs: 10 * 60 * 1000,
  limit: 10,
  key: (req) => [
    `ip:${getIpAddress(req)}`,
    req.user?.userId ? `user:${req.user.userId}` : null,
  ],
})

export const adminRateLimit = createRateLimiter({
  namespace: 'admin',
  windowMs: 5 * 60 * 1000,
  limit: 50,
  key: (req) => [
    `ip:${getIpAddress(req)}`,
    req.user?.userId ? `user:${req.user.userId}` : null,
  ],
})
