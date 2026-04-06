import request from 'supertest'
import { jest } from '@jest/globals'
import { buildTestApp } from '../helpers/build-test-app.js'

const createProductMock = jest.fn()
const getProductsMock = jest.fn()
const getProductByIdMock = jest.fn()
const updateProductMock = jest.fn()
const deleteProductMock = jest.fn()

jest.unstable_mockModule('../../services/product.service.js', () => ({
  createProduct: createProductMock,
  getProducts: getProductsMock,
  getProductById: getProductByIdMock,
  updateProduct: updateProductMock,
  deleteProduct: deleteProductMock,
}))

jest.unstable_mockModule('../../middleware/auth.middleware.js', () => ({
  default: (req, res, next) => {
    const token = req.headers.authorization
    if (token === 'Bearer admin-token') {
      req.user = { userId: 'admin-id', role: 'ADMIN' }
      return next()
    }

    const error = new Error('Not authorized')
    error.statusCode = 401
    return next(error)
  },
}))

jest.unstable_mockModule('../../middleware/admin.middleware.js', () => ({
  default: (req, res, next) => {
    if (req.user?.role === 'ADMIN') {
      return next()
    }

    const error = new Error('Admin access only')
    error.statusCode = 403
    return next(error)
  },
}))

jest.unstable_mockModule('../../middleware/upload.middleware.js', () => ({
  default: {
    array: () => (req, res, next) => {
      req.files = []
      return next()
    },
  },
  requireCloudinaryUpload: (req, res, next) => next(),
}))

const { default: productRoutes } = await import('../../routes/product.routes.js')
const app = buildTestApp('/api/products', productRoutes)

describe('Product API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('GET /api/products returns 200', async () => {
    getProductsMock.mockResolvedValue({ success: true, products: [] })
    const response = await request(app).get('/api/products')
    expect(response.status).toBe(200)
  })

  it('GET /api/products/:id returns 200', async () => {
    getProductByIdMock.mockResolvedValue({ success: true, product: { id: '1' } })
    const response = await request(app).get('/api/products/507f1f77bcf86cd799439011')
    expect(response.status).toBe(200)
  })

  it('POST /api/products returns 401 without auth', async () => {
    const response = await request(app).post('/api/products').send({
      name: 'Phone',
      description: 'desc',
      price: 10,
      category: 'tech',
    })

    expect(response.status).toBe(401)
  })

  it('POST /api/products returns 201 for admin', async () => {
    createProductMock.mockResolvedValue({ success: true, product: { id: '1' } })
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', 'Bearer admin-token')
      .send({
        name: 'Phone',
        description: 'desc',
        price: 10,
        category: 'tech',
        stock: 2,
      })

    expect(response.status).toBe(201)
  })

  it('PUT /api/products/:id returns 200 for admin', async () => {
    updateProductMock.mockResolvedValue({ success: true, product: { id: '1' } })
    const response = await request(app)
      .put('/api/products/507f1f77bcf86cd799439011')
      .set('Authorization', 'Bearer admin-token')
      .send({ price: 99 })

    expect(response.status).toBe(200)
  })

  it('DELETE /api/products/:id returns 200 for admin', async () => {
    deleteProductMock.mockResolvedValue({ success: true, message: 'deleted' })
    const response = await request(app)
      .delete('/api/products/507f1f77bcf86cd799439011')
      .set('Authorization', 'Bearer admin-token')

    expect(response.status).toBe(200)
  })
})
