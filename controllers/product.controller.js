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

/* ======*GET ALL PRODUCTS (SEARCH + FILTER + PAGINATION)*====== */
const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sort,
  } = req.query

  /* ======* BUILD QUERY OBJECT *====== */
  let query = {}

  //  SEARCH (by name)
  if (search) {
    query.name = { $regex: search, $options: 'i' }
  }

  //  CATEGORY FILTER
  if (category) {
    query.category = category
  }

  //  PRICE FILTER
  if (minPrice || maxPrice) {
    query.price = {}

    if (minPrice) query.price.$gte = Number(minPrice)
    if (maxPrice) query.price.$lte = Number(maxPrice)
  }

  /* ======* SORTING *====== */
  let sortOption = {}
  if (sort) {
    // Example: price or -price
    sortOption[sort.replace('-', '')] = sort.startsWith('-') ? -1 : 1
  } else {
    sortOption = { createdAt: -1 } // default latest
  }

  /* ======* PAGINATION *====== */
  const pageNumber = Number(page)
  const limitNumber = Number(limit)
  const skip = (pageNumber - 1) * limitNumber

  /* ======* EXECUTE QUERY *====== */
  const products = await Product.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNumber)

  const totalProducts = await Product.countDocuments(query)

  /* ======* RESPONSE *====== */
  res.status(200).json({
    success: true,
    total: totalProducts,
    page: pageNumber,
    pages: Math.ceil(totalProducts / limitNumber),
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
