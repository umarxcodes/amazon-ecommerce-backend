import dotenv from 'dotenv'
dotenv.config()

import app from './app.js'
import connectDB from './config/db.config.js'

const PORT = 5000

// Connect to MongoDB
connectDB()

app.listen(PORT, () => {
  console.info(`[${new Date().toDateString()}] Server is Running`)
})
