import { Redis } from '@upstash/redis'
import { env, isRedisConfigured } from './env.config.js'

if (!isRedisConfigured()) {
  throw new Error(
    'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required for distributed rate limiting.'
  )
}

const redis = new Redis({
  url: env.upstashRedisRestUrl,
  token: env.upstashRedisRestToken,
})

export const ensureRedisConnection = async () => {
  await redis.ping()
}

/* =====*** EXPORT ***===== */
export default redis
