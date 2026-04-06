import express from 'express'
import request from 'supertest'
import { jest } from '@jest/globals'
import errorHandler from '../../middleware/error.middleware.js'

const registerUserMock = jest.fn()
const loginUserMock = jest.fn()
const createAdminUserMock = jest.fn()

const authMiddlewareMock = (req, res, next) => {
  if (req.headers.authorization === 'Bearer admin-token') {
    req.user = { userId: 'admin-id', role: 'ADMIN' }
    return next()
  }

  const error = new Error('Not authorized')
  error.statusCode = 401
  return next(error)
}

const adminMiddlewareMock = (req, res, next) => {
  if (req.user?.role === 'ADMIN') {
    return next()
  }

  const error = new Error('Admin access only')
  error.statusCode = 403
  return next(error)
}

jest.unstable_mockModule('../../services/auth.service.js', () => ({
  registerUser: registerUserMock,
  loginUser: loginUserMock,
  createAdminUser: createAdminUserMock,
}))

jest.unstable_mockModule('../../middleware/auth.middleware.js', () => ({
  default: authMiddlewareMock,
}))

jest.unstable_mockModule('../../middleware/admin.middleware.js', () => ({
  default: adminMiddlewareMock,
}))

const { default: authRoutes } = await import('../../routes/auth.routes.js')

const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use(errorHandler)

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('POST /api/auth/register returns 201 for valid registration', async () => {
    registerUserMock.mockResolvedValue({ success: true, message: 'registered' })

    const response = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123',
    })

    expect(response.status).toBe(201)
    expect(registerUserMock).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123',
    })
  })

  it('POST /api/auth/register returns 400 for invalid payload', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: '',
      email: 'bad-email',
      password: '123',
    })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.statusCode).toBe(400)
  })

  it('POST /api/auth/login returns 200 for valid credentials', async () => {
    loginUserMock.mockResolvedValue({ success: true, message: 'ok' })

    const response = await request(app).post('/api/auth/login').send({
      email: 'jane@example.com',
      password: 'secret123',
    })

    expect(response.status).toBe(200)
    expect(loginUserMock).toHaveBeenCalled()
  })

  it('POST /api/auth/admin-create returns 401 without admin auth', async () => {
    const response = await request(app).post('/api/auth/admin-create').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'secret123',
    })

    expect(response.status).toBe(401)
  })

  it('POST /api/auth/admin-create returns 201 for admin token', async () => {
    createAdminUserMock.mockResolvedValue({ success: true, message: 'created' })

    const response = await request(app)
      .post('/api/auth/admin-create')
      .set('Authorization', 'Bearer admin-token')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'secret123',
      })

    expect(response.status).toBe(201)
    expect(createAdminUserMock).toHaveBeenCalled()
  })
})
