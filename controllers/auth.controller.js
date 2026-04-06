/*
📁 FILE: auth.controller.js
📌 PURPOSE: Orchestrates authentication HTTP requests and delegates business
logic to the auth service layer.
========================================
*/

/* ===== IMPORTS ===== */
import {
  createAdminUser,
  loginUser,
  registerUser,
} from '../services/auth.service.js'
import { asyncHandler } from '../utils/async-handler.util.js'

/* ===== AUTH CONTROLLER ===== */
/* Handles user registration, login, and privileged admin creation flows. */

/* ===== REGISTER USER FUNCTION ===== */
/* Creates a regular user account and returns a safe response payload. */
const register = asyncHandler(async (req, res) => {
  const response = await registerUser(req.body)
  res.status(201).json(response)
})

/* ===== LOGIN USER FUNCTION ===== */
/* Validates credentials and returns an access token plus safe user details. */
const login = asyncHandler(async (req, res) => {
  const response = await loginUser(req.body)
  res.status(200).json(response)
})

/* ===== CREATE ADMIN FUNCTION ===== */
/* Creates an admin account for authorized administrative users. */
const createAdmin = asyncHandler(async (req, res) => {
  const response = await createAdminUser(req.body)
  res.status(201).json(response)
})

/* ===== EXPORT CONTROLLER ===== */
export default {
  register,
  login,
  createAdmin,
}
