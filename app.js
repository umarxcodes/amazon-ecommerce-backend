import express from 'express'
import cors from 'cors'
import productRoutes from './routes/product.routes.js'
import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/order.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import errorHandler from './middleware/error.middleware.js'
import stripeWebhook from './webhooks/stripe.webhook.js'
import {
  applyAppSecurity,
  corsOptions,
} from './middleware/security.middleware.js'
import { apiDdosRateLimit } from './middleware/rate-limit.middleware.js'
import { createAppError } from './utils/app-error.util.js'

const app = express()

applyAppSecurity(app)
app.use(cors(corsOptions))

app.post(
  '/api/payment/webhook/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use('/api', apiDdosRateLimit)

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payment', paymentRoutes)

app.get('/', (req, res) => {
  res.json({ success: true, message: 'API is running' })
})

app.use((req, res, next) => {
  next(createAppError(`Route ${req.method} ${req.originalUrl} not found`, 404))
})

app.use(errorHandler)

export default app
