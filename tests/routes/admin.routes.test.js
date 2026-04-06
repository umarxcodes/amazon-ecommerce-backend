import request from 'supertest'
import { jest } from '@jest/globals'
import { buildTestApp } from '../helpers/build-test-app.js'

const createAdminMock = jest.fn()
const getAllUsersMock = jest.fn()
const changeUserRoleMock = jest.fn()
const deactivateUserMock = jest.fn()

jest.unstable_mockModule('../../services/admin.service.js', () => ({
  createAdmin: createAdminMock,
  getAllUsers: getAllUsersMock,
  changeUserRole: changeUserRoleMock,
  deactivateUser: deactivateUserMock,
}))

jest.unstable_mockModule('../../middleware/auth.middleware.js', () => ({
  default: (req, res, next) => {
    if (req.headers.authorization === 'Bearer admin-token') {
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

const { default: adminRoutes } = await import('../../routes/admin.routes.js')
const app = buildTestApp('/api/admin', adminRoutes)

describe('Admin API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('POST /api/admin/create-admin creates an admin', async () => {
    createAdminMock.mockResolvedValue({ success: true, data: {} })
    const response = await request(app)
      .post('/api/admin/create-admin')
      .set('Authorization', 'Bearer admin-token')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'secret123',
      })

    expect(response.status).toBe(201)
  })

  it('GET /api/admin/users returns all users', async () => {
    getAllUsersMock.mockResolvedValue({ success: true, data: [] })
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', 'Bearer admin-token')

    expect(response.status).toBe(200)
  })

  it('PATCH /api/admin/users/:id/role updates the role', async () => {
    changeUserRoleMock.mockResolvedValue({ success: true, data: {} })
    const response = await request(app)
      .patch('/api/admin/users/507f1f77bcf86cd799439011/role')
      .set('Authorization', 'Bearer admin-token')
      .send({ role: 'USER' })

    expect(response.status).toBe(200)
  })

  it('PATCH /api/admin/users/:id/deactivate deactivates the user', async () => {
    deactivateUserMock.mockResolvedValue({ success: true, data: {} })
    const response = await request(app)
      .patch('/api/admin/users/507f1f77bcf86cd799439011/deactivate')
      .set('Authorization', 'Bearer admin-token')

    expect(response.status).toBe(200)
  })
})
