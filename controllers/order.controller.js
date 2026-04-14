import {
  createOrder as createOrderService,
  getMyOrders as getMyOrdersService,
  getOrderById as getOrderByIdService,
  cancelOrder as cancelOrderService,
} from '../services/order.service.js'
import { asyncHandler } from '../utils/async-handler.util.js'

const createOrder = asyncHandler(async (req, res) => {
  const response = await createOrderService({
    userId: req.user.userId,
    shippingAddress: req.body.shippingAddress,
  })
  res.status(201).json(response)
})

const getMyOrders = asyncHandler(async (req, res) => {
  const response = await getMyOrdersService(req.user.userId)
  res.status(200).json(response)
})

const getOrderById = asyncHandler(async (req, res) => {
  const response = await getOrderByIdService({
    orderId: req.params.id,
    userId: req.user.userId,
    role: req.user.role,
  })
  res.status(200).json(response)
})

const cancelOrder = asyncHandler(async (req, res) => {
  const response = await cancelOrderService({
    orderId: req.params.id,
    userId: req.user.userId,
    role: req.user.role,
  })
  res.status(200).json(response)
})

export default {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
}
