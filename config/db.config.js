import mongoose from 'mongoose'
import { env } from './env.config.js'

let cachedConnectionPromise = null

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (cachedConnectionPromise) {
    return cachedConnectionPromise
  }

  try {
    cachedConnectionPromise = mongoose.connect(env.mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    })

    const conn = await cachedConnectionPromise

    console.log(`MongoDB connected: ${conn.connection.host}`)

    return conn
  } catch (error) {
    cachedConnectionPromise = null
    console.error(`MongoDB Connection Error: ${error.message}`)
    throw error
  }
}

export default connectDB
