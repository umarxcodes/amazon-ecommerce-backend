import app from '../app.js'
import connectDB from '../config/db.config.js'

let bootstrapPromise = null

const ensureBootstrap = async () => {
  if (!bootstrapPromise) {
    bootstrapPromise = connectDB().catch((error) => {
      bootstrapPromise = null
      throw error
    })
  }

  return bootstrapPromise
}

export default async function handler(req, res) {
  await ensureBootstrap()
  return app(req, res)
}
