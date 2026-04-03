/* =====*** IMPORTS ***===== */
import asyncHandler from 'express-async-handler'
import {
  createAdminUser,
  loginUser,
  registerUser,
} from '../services/auth.service.js'

/* ================================* REGISTER USER *=============================== */

const register = asyncHandler(async (req, res) => {
  const response = await registerUser(req.body)
  res.status(201).json(response)
})

/* ================================* LOGIN USER *=============================== */

const login = asyncHandler(async (req, res) => {
  const response = await loginUser(req.body)
  res.status(200).json(response)
})

const createAdmin = asyncHandler(async (req, res) => {
  const response = await createAdminUser(req.body)
  res.status(201).json(response)
})

/* =====*** EXPORT CONTROLLER ***===== */
export default {
  register,
  login,
  createAdmin,
}
