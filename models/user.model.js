/* =====*** IMPORTS ***===== */
import mongoose from 'mongoose'

/* ================================* USER SCHEMA *=============================== */
const userSchema = new mongoose.Schema(
  {
    /* =====*** USER NAME ***===== */
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    /* =====*** USER EMAIL ***===== */
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email'],
    },

    /* =====*** USER PASSWORD ***===== */
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // hide password by default
    },

    /* =====*** USER ROLE ***===== */
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },

    /* =====*** ACCOUNT STATUS ***===== */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

/* =====*** EXPORT MODEL ***===== */
export default mongoose.model('User', userSchema)
