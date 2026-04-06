/*
📁 FILE: auth.service.unit.test.js
📌 PURPOSE: Unit-tests the auth service in isolation by mocking persistence,
hashing, and token generation dependencies.
========================================
*/

import { jest } from '@jest/globals'

const findOneMock = jest.fn()
const createMock = jest.fn()
const comparePasswordMock = jest.fn()
const hashPasswordMock = jest.fn()
const generateAccessTokenMock = jest.fn()

jest.unstable_mockModule('../models/user.model.js', () => ({
  default: {
    create: createMock,
    findOne: findOneMock,
  },
}))

jest.unstable_mockModule('../utils/hash.util.js', () => ({
  comparePassword: comparePasswordMock,
  hashPassword: hashPasswordMock,
}))

jest.unstable_mockModule('../utils/jwt.util.js', () => ({
  generateAccessToken: generateAccessTokenMock,
}))

const { loginUser, registerUser } = await import('../services/auth.service.js')

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('registers a user and returns a safe user payload', async () => {
    hashPasswordMock.mockResolvedValue('hashed-secret')
    createMock.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'USER',
    })

    const response = await registerUser({
      name: 'Jane Doe',
      email: 'Jane@example.com',
      password: 'secret123',
    })

    expect(hashPasswordMock).toHaveBeenCalledWith('secret123')
    expect(createMock).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashed-secret',
      role: 'USER',
    })
    expect(response.data).toEqual({
      id: '507f1f77bcf86cd799439011',
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'USER',
    })
  })

  it('logs in an active user with valid credentials', async () => {
    const selectMock = jest.fn().mockResolvedValue({
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashed-secret',
      role: 'USER',
    })

    findOneMock.mockReturnValue({ select: selectMock })
    comparePasswordMock.mockResolvedValue(true)
    generateAccessTokenMock.mockReturnValue('jwt-token')

    const response = await loginUser({
      email: 'jane@example.com',
      password: 'secret123',
    })

    expect(findOneMock).toHaveBeenCalledWith({
      email: 'jane@example.com',
      isActive: true,
    })
    expect(comparePasswordMock).toHaveBeenCalledWith('secret123', 'hashed-secret')
    expect(generateAccessTokenMock).toHaveBeenCalledWith({
      userId: '507f1f77bcf86cd799439011',
      role: 'USER',
    })
    expect(response.data.accessToken).toBe('jwt-token')
  })
})
