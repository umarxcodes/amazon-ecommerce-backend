/* =====*** IMPORTS ***===== */
import mongoose from 'mongoose'

/* ================= ORDER ITEM SCHEMA =================*/
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    name: String, // snapshot
    price: Number, // snapshot
    quantity: Number,
    image: String, // snapshot
  },
  { _id: false }
)

/* ================= ORDER SCHEMA ================= */
const orderSchema = new mongoose.Schema(
  {
    /* ===== USER REFERENCE ===== */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    /* ===== ORDER ITEMS ===== */
    items: [orderItemSchema],

    /* ===== SHIPPING INFO ===== */
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    /* ===== PAYMENT ===== */
    paymentMethod: {
      type: String,
      default: 'stripe',
    },

    /* ===== PRICING ===== */
    totalPrice: {
      type: Number,
      required: true,
    },

    /* ===== PAYMENT STATUS ===== */
    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: Date,

    /* ===== ORDER STATUS ===== */
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
)

/* ===== EXPORT MODEL ===== */
export default mongoose.model('Order', orderSchema)
