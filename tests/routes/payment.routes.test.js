import request from 'supertest'
import { jest } from '@jest/globals'
import { buildTestApp } from '../helpers/build-test-app.js'

const findByIdMock = jest.fn()
const populateMock = jest.fn()
const createCheckoutSessionMock = jest.fn()

jest.unstable_mockModule('../../models/order.model.js', () => ({
  default: {
    findById: findByIdMock,
  },
}))

jest.unstable_mockModule('../../services/payment.service.js', () => ({
  createCheckoutSession: createCheckoutSessionMock,
}))

jest.unstable_mockModule('../../middleware/auth.middleware.js', () => ({
  default: (req, res, next) => {
    if (req.headers.authorization === 'Bearer user-token') {
      req.user = { userId: 'user-id', role: 'USER' }
      return next()
    }

    const error = new Error('Not authorized')
    error.statusCode = 401
    return next(error)
  },
}))

const { default: paymentRoutes } = await import('../../routes/payment.routes.js')
const app = buildTestApp('/api/payment', paymentRoutes)

describe('Payment API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    findByIdMock.mockReturnValue({ populate: populateMock })
  })

  it('POST /api/payment/checkout creates a checkout session', async () => {
    populateMock.mockResolvedValue({
      _id: 'order-id',
      user: { _id: { toString: () => 'user-id' }, email: 'jane@example.com' },
      items: [{ name: 'Phone', price: 10, quantity: 1 }],
      isPaid: false,
    })
    createCheckoutSessionMock.mockResolvedValue({ id: 'cs_123', url: 'https://stripe.test' })

    const response = await request(app)
      .post('/api/payment/checkout')
      .set('Authorization', 'Bearer user-token')
      .send({ orderId: '507f1f77bcf86cd799439011' })

    expect(response.status).toBe(200)
    expect(response.body.sessionId).toBe('cs_123')
  })

  it('POST /api/payment/checkout returns 400 for invalid orderId', async () => {
    const response = await request(app)
      .post('/api/payment/checkout')
      .set('Authorization', 'Bearer user-token')
      .send({ orderId: 'bad-id' })

    expect(response.status).toBe(400)
  })
})
