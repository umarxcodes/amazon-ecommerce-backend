/* ======*IMPORTS*====== */
import Product from '../models/product.model.js'
import asyncHandler from 'express-async-handler'
import { productValidationSchema } from '../validations/product.validation.js'

/* ======*CREATE PRODUCT (ADMIN)*====== */
const createProduct = asyncHandler(async (req, res) => {
  await productValidationSchema.validate(req.body)

  const product = await Product.create(req.body)

  res.status(201).json({
    success: true,
    product,
  })
})

/* ======*GET ALL PRODUCTS*====== */
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()

  res.status(200).json({
    success: true,
    count: products.length,
    products,
  })
})

/* ======*GET SINGLE PRODUCT*====== */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  res.status(200).json({
    success: true,
    product,
  })
})

/* ======*UPDATE PRODUCT (ADMIN)*====== */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  Object.assign(product, req.body)

  await product.save()

  res.status(200).json({
    success: true,
    product,
  })
})

/* ======*DELETE PRODUCT (ADMIN)*====== */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  await product.deleteOne()

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  })
})

export default {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getProducts,
}
