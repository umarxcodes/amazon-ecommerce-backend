import { Redis } from '@upstash/redis'
import { env, isRedisConfigured } from './env.config.js'

const redis = isRedisConfigured()
  ? new Redis({
      url: env.upstashRedisRestUrl,
      token: env.upstashRedisRestToken,
    })
  : null

export const ensureRedisConnection = async () => {
  if (!redis) {
    return false
  }

  await redis.ping()
  return true
}

export const isRedisAvailable = () => Boolean(redis)

export default redis
