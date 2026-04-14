import app from './app.js'
import connectDB from './config/db.config.js'
import { env, validateEnv } from './config/env.config.js'
import { ensureRedisConnection } from './config/redis.config.js'

const startServer = async () => {
  validateEnv()
  await connectDB()
  await ensureRedisConnection()

  const server = app.listen(env.port, () => {
    console.info(`Server running on port ${env.port}`)
  })

  const shutdown = async (signal) => {
    console.info(`Received ${signal}. Shutting down gracefully...`)
    server.close(() => process.exit(0))
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

startServer().catch((error) => {
  console.error(`Server Startup Error: ${error.message}`)
  process.exit(1)
})
