/*
📁 FILE: admin.controller.js
📌 PURPOSE: Handles administrator-only APIs for user administration and
privileged account management.
========================================
*/

import {
  createAdmin as createAdminService,
  getAllUsers as getAllUsersService,
  changeUserRole as changeUserRoleService,
  deactivateUser as deactivateUserService,
} from '../services/admin.service.js'
import { asyncHandler } from '../utils/async-handler.util.js'

/* ===== ADMIN CONTROLLER ===== */
/* Handles privileged user-management workflows for administrators. */

/* ===== CREATE ADMIN FUNCTION ===== */
/* Creates a new administrator account. */
const createAdmin = asyncHandler(async (req, res) => {
  const response = await createAdminService(req.body)
  res.status(201).json(response)
})

/* ===== GET ALL USERS FUNCTION ===== */
/* Returns all users for administrative review. */
const getAllUsers = asyncHandler(async (req, res) => {
  const response = await getAllUsersService()
  res.status(200).json(response)
})

/* ===== CHANGE USER ROLE FUNCTION ===== */
/* Updates the role of a target user while preserving self-protection checks. */
const changeUserRole = asyncHandler(async (req, res) => {
  const response = await changeUserRoleService({
    actorUserId: req.user.userId,
    targetUserId: req.params.id,
    role: req.body.role,
  })
  res.status(200).json(response)
})

/* ===== DEACTIVATE USER FUNCTION ===== */
/* Soft-disables a target user account. */
const deactivateUser = asyncHandler(async (req, res) => {
  const response = await deactivateUserService(req.params.id)
  res.status(200).json(response)
})

export default {
  createAdmin,
  getAllUsers,
  changeUserRole,
  deactivateUser,
}
