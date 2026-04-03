import app from './app.js'
import connectDB from './config/db.config.js'
import { env, validateEnv } from './config/env.config.js'
import { ensureRedisConnection } from './config/redis.config.js'

const startServer = async () => {
  validateEnv()
  await connectDB()
  await ensureRedisConnection()

  app.listen(env.port, () => {
    console.info(
      `[${new Date().toDateString()}] Server is Running on port ${env.port}`
    )
  })
}

startServer().catch((error) => {
  console.error(`=====*** Server Startup Error: ${error.message} ***=====`)
  process.exit(1)
})
