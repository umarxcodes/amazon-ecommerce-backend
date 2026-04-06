import request from 'supertest'
import { jest } from '@jest/globals'
import { buildTestApp } from '../helpers/build-test-app.js'

const createOrderMock = jest.fn()
const getMyOrdersMock = jest.fn()
const getOrderByIdMock = jest.fn()

jest.unstable_mockModule('../../services/order.service.js', () => ({
  createOrder: createOrderMock,
  getMyOrders: getMyOrdersMock,
  getOrderById: getOrderByIdMock,
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

const { default: orderRoutes } = await import('../../routes/order.routes.js')
const app = buildTestApp('/api/orders', orderRoutes)

describe('Order API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('POST /api/orders creates an order', async () => {
    createOrderMock.mockResolvedValue({ success: true, order: { id: '1' } })
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer user-token')
      .send({
        shippingAddress: {
          address: 'Street 1',
          city: 'Lahore',
          postalCode: '54000',
          country: 'PK',
        },
      })

    expect(response.status).toBe(201)
  })

  it('POST /api/orders returns 400 for invalid shipping address', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer user-token')
      .send({ shippingAddress: { city: 'Only city' } })

    expect(response.status).toBe(400)
  })

  it('GET /api/orders/my returns order history', async () => {
    getMyOrdersMock.mockResolvedValue({ success: true, orders: [] })
    const response = await request(app)
      .get('/api/orders/my')
      .set('Authorization', 'Bearer user-token')

    expect(response.status).toBe(200)
  })

  it('GET /api/orders/:id returns one order', async () => {
    getOrderByIdMock.mockResolvedValue({ success: true, order: { id: '1' } })
    const response = await request(app)
      .get('/api/orders/507f1f77bcf86cd799439011')
      .set('Authorization', 'Bearer user-token')

    expect(response.status).toBe(200)
  })
})
