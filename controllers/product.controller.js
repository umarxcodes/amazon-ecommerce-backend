/* =====*** IMPORTS ***===== */
import Product from '../models/product.model.js'
import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'

/* ================================* CREATE PRODUCT (ADMIN) *=============================== */
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body)

  res.status(201).json({
    success: true,
    product,
  })
})

/* ================================* GET ALL PRODUCTS (SEARCH + FILTER + PAGINATION) *=============================== */
const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    rating,
    sort,
    page = 1,
    limit = 10,
  } = req.query

  /* =====*** BASE QUERY ***===== */
  let query = {}

  /* =====*** SEARCH (MULTI-FIELD) ***===== */
  if (search) {
    query.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
    ]
  }

  /* =====*** CATEGORY FILTER ***===== */
  if (category) {
    query.category = category
  }

  /* =====*** PRICE FILTER ***===== */
  if (minPrice || maxPrice) {
    query.price = {}
    if (minPrice) query.price.$gte = Number(minPrice)
    if (maxPrice) query.price.$lte = Number(maxPrice)
  }

  /* =====*** RATING FILTER ***===== */
  if (rating) {
    query.ratings = { $gte: Number(rating) }
  }

  /* =====*** SORTING ***===== */
  const allowedSortFields = ['price', 'createdAt', 'ratings']
  let sortOption = { createdAt: -1 }

  if (sort) {
    const field = sort.replace('-', '')
    if (allowedSortFields.includes(field)) {
      sortOption = {
        [field]: sort.startsWith('-') ? -1 : 1,
      }
    }
  }

  /* =====*** PAGINATION ***===== */
  const pageNumber = Math.max(1, Number(page))
  const limitNumber = Math.max(1, Number(limit))
  const skip = (pageNumber - 1) * limitNumber

  /* =====*** DATABASE QUERY (PARALLEL) ***===== */
  const [products, total] = await Promise.all([
    Product.find(query).sort(sortOption).skip(skip).limit(limitNumber),
    Product.countDocuments(query),
  ])

  /* =====*** RESPONSE ***===== */
  res.status(200).json({
    success: true,
    total,
    page: pageNumber,
    pages: Math.ceil(total / limitNumber),
    results: products.length,
    products,
  })
})

/* ================================* GET SINGLE PRODUCT *=============================== */
const getProductById = asyncHandler(async (req, res) => {
  /* =====*** VALIDATE OBJECT ID ***===== */
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400)
    throw new Error('Invalid product ID')
  }

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

/* ================================* UPDATE PRODUCT (ADMIN) *=============================== */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  /* =====*** ALLOWED FIELDS (SECURITY) ***===== */
  const allowedUpdates = [
    'name',
    'description',
    'price',
    'category',
    'stock',
    'images',
  ]

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field]
    }
  })

  await product.save()

  res.status(200).json({
    success: true,
    product,
  })
})

/* ================================* DELETE PRODUCT (ADMIN) *=============================== */
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

/* =====*** EXPORT CONTROLLER ***===== */
export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
}
