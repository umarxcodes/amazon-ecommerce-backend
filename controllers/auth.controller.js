import { loginUser, registerUser } from '../services/auth.service.js'
import { asyncHandler } from '../utils/async-handler.util.js'

const register = asyncHandler(async (req, res) => {
  const response = await registerUser(req.body)
  res.status(201).json(response)
})

const login = asyncHandler(async (req, res) => {
  const response = await loginUser(req.body)
  res.status(200).json(response)
})

export default {
  register,
  login,
}
