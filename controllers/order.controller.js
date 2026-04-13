/*
📁 FILE: order.controller.js
📌 PURPOSE: Exposes order creation and retrieval endpoints for authenticated
users while keeping business rules inside the order service.
========================================
*/

/* ===== IMPORTS ===== */
import {
  createOrder as createOrderService,
  getMyOrders as getMyOrdersService,
  getOrderById as getOrderByIdService,
  cancelOrder as cancelOrderService,
} from '../services/order.service.js'
import { asyncHandler } from '../utils/async-handler.util.js'

/* ===== ORDER CONTROLLER ===== */
/* Handles order creation and access for owners or administrators. */

/* ===== CREATE ORDER FUNCTION ===== */
/* Creates an order from the current cart and returns the persisted order. */
const createOrder = asyncHandler(async (req, res) => {
  const response = await createOrderService({
    userId: req.user.userId,
    shippingAddress: req.body.shippingAddress,
  })
  res.status(201).json(response)
})

/* ===== GET MY ORDERS FUNCTION ===== */
/* Returns the current user's order history in descending creation order. */
const getMyOrders = asyncHandler(async (req, res) => {
  const response = await getMyOrdersService(req.user.userId)
  res.status(200).json(response)
})

/* ===== GET ORDER BY ID FUNCTION ===== */
/* Returns one order if the requester is the owner or an administrator. */
const getOrderById = asyncHandler(async (req, res) => {
  const response = await getOrderByIdService({
    orderId: req.params.id,
    userId: req.user.userId,
    role: req.user.role,
  })
  res.status(200).json(response)
})

/* ===== CANCEL ORDER FUNCTION ===== */
/* Cancels an unpaid pending order and restores the deducted stock. */
const cancelOrder = asyncHandler(async (req, res) => {
  const response = await cancelOrderService({
    orderId: req.params.id,
    userId: req.user.userId,
    role: req.user.role,
  })
  res.status(200).json(response)
})

/* ===== EXPORT CONTROLLER ===== */
export default {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
}
