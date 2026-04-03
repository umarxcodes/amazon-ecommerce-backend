import redis from '../config/redis.config.js'

export const getCartCacheKey = (userId) => `cart:${userId}`
const productCacheVersionKey = 'products:cache:version'

export const clearCartCache = async (userId) => {
  if (!redis) return
  await redis.del(getCartCacheKey(userId))
}

export const clearProductCache = async () => {
  if (!redis) return
  await redis.incr(productCacheVersionKey)
}

export const getProductCacheVersion = async () => {
  if (!redis) return '0'

  const version = await redis.get(productCacheVersionKey)
  return String(version || '0')
}

export const getCachedValue = async (key) => {
  if (!redis) return null
  return redis.get(key)
}

export const setCachedValue = async (key, value, options) => {
  if (!redis) return null
  return redis.set(key, value, options)
}
