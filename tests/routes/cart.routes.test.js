import request from 'supertest'
import { jest } from '@jest/globals'
import { buildTestApp } from '../helpers/build-test-app.js'

const addToCartMock = jest.fn()
const getCartMock = jest.fn()
const updateCartItemMock = jest.fn()
const removeFromCartMock = jest.fn()
const clearCartMock = jest.fn()

jest.unstable_mockModule('../../services/cart.service.js', () => ({
  addToCart: addToCartMock,
  getCart: getCartMock,
  updateCartItem: updateCartItemMock,
  removeFromCart: removeFromCartMock,
  clearCart: clearCartMock,
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

const { default: cartRoutes } = await import('../../routes/cart.routes.js')
const app = buildTestApp('/api/cart', cartRoutes)

describe('Cart API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('POST /api/cart adds an item', async () => {
    addToCartMock.mockResolvedValue({ success: true, cart: {} })
    const response = await request(app)
      .post('/api/cart')
      .set('Authorization', 'Bearer user-token')
      .send({ productId: '507f1f77bcf86cd799439011', quantity: 1 })

    expect(response.status).toBe(200)
  })

  it('POST /api/cart returns 400 for invalid body', async () => {
    const response = await request(app)
      .post('/api/cart')
      .set('Authorization', 'Bearer user-token')
      .send({ quantity: 0 })

    expect(response.status).toBe(400)
  })

  it('GET /api/cart returns current cart', async () => {
    getCartMock.mockResolvedValue({ success: true, cart: { items: [] } })
    const response = await request(app)
      .get('/api/cart')
      .set('Authorization', 'Bearer user-token')

    expect(response.status).toBe(200)
  })

  it('PUT /api/cart/:productId updates quantity', async () => {
    updateCartItemMock.mockResolvedValue({ success: true, cart: {} })
    const response = await request(app)
      .put('/api/cart/507f1f77bcf86cd799439011')
      .set('Authorization', 'Bearer user-token')
      .send({ quantity: 3 })

    expect(response.status).toBe(200)
  })

  it('DELETE /api/cart/:productId removes an item', async () => {
    removeFromCartMock.mockResolvedValue({ success: true, cart: {} })
    const response = await request(app)
      .delete('/api/cart/507f1f77bcf86cd799439011')
      .set('Authorization', 'Bearer user-token')

    expect(response.status).toBe(200)
  })

  it('DELETE /api/cart clears the cart', async () => {
    clearCartMock.mockResolvedValue({ success: true, cart: { items: [] } })
    const response = await request(app)
      .delete('/api/cart')
      .set('Authorization', 'Bearer user-token')

    expect(response.status).toBe(200)
  })
})
