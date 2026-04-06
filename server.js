/*
📁 FILE: server.js
📌 PURPOSE: Boots infrastructure dependencies, starts the HTTP server, and
handles graceful shutdown for long-running environments.
========================================
*/

import app from './app.js'
import connectDB from './config/db.config.js'
import { env, validateEnv } from './config/env.config.js'
import { ensureRedisConnection } from './config/redis.config.js'

/* ===== SERVER STARTUP FUNCTION ===== */
/* Initializes required infrastructure and starts the Express server. */
const startServer = async () => {
  validateEnv()
  await connectDB()
  await ensureRedisConnection()

  const server = app.listen(env.port, () => {
    console.info(
      `[${new Date().toDateString()}] Server is Running on port ${env.port}`
    )
  })

  const shutdown = async (signal) => {
    console.info(`Received ${signal}. Shutting down gracefully...`)
    server.close(() => process.exit(0))
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

startServer().catch((error) => {
  console.error(`=====*** Server Startup Error: ${error.message} ***=====`)
  process.exit(1)
})
