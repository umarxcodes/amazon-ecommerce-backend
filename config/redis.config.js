/* =====*** IMPORTS ***===== */
import 'dotenv/config'
import { Redis } from '@upstash/redis'

/* =====*** CREATE REDIS INSTANCE ***===== */
const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  throw new Error(
    'Missing Redis env vars: UPSTASH_REDIS_REST_URL and/or UPSTASH_REDIS_REST_TOKEN'
  )
}

const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
})

/* =====*** EXPORT ***===== */
export default redis
