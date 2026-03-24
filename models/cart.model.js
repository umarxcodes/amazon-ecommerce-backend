/* =====*** IMPORTS ***===== */
import mongoose from 'mongoose'

/* ================= CART ITEM SCHEMA ================= */
const cartItemSchema = new mongoose.Schema(
  {
    /* ===== PRODUCT REFERENCE ===== */
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    /* ===== QUANTITY ===== */
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Quantity must be at least 1'],
    },

    /* ===== PRICE SNAPSHOT ===== */
    // Important: store price at time of adding
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
)

/* ================= CART SCHEMA ================= */
const cartSchema = new mongoose.Schema(
  {
    /* ===== USER (ONE CART PER USER) ===== */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    /* ===== CART ITEMS ===== */
    items: [cartItemSchema],

    /* ===== TOTAL PRICE ===== */
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
)

/* ===== EXPORT MODEL ===== */
export default mongoose.model('Cart', cartSchema)
