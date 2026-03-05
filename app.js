/* =====*** IMPORTS ***===== */
import express from 'express'
import dotenv from 'dotenv'
import productRoutes from './routes/product.routes.js'
import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js'
import errorHandler from './middleware/error.middleware.js'

dotenv.config()
const app = express()

/* =====*** GLOBAL MIDDLEWARES ***===== */
app.use(express.json())

/* =====*** ROUTES ***===== */
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/admin', adminRoutes)
/* =====*** HEALTH CHECK ***===== */
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API is Running 👍' })
})

/* =====*** ERROR HANDLER ***===== */
app.use(errorHandler)

export default app
