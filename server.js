// ======*IMPORT FILE

import app from './app.js'
const PORT = 5000

import connectDB from './config/db.js'

// ======*ENV*======
import dotenv from 'dotenv'
dotenv.config()

// ======*connect DB*======
connectDB()

app.listen(PORT, () => {
  console.info(`[${new Date().toDateString()}] Server is Running `)
})
