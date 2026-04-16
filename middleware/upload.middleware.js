import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.config.js'
import { isCloudinaryConfigured } from '../config/env.config.js'
import { createAppError } from '../utils/app-error.util.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, '..', 'uploads', 'products')
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

const ensureUploadsDir = () => {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const buildLocalFilename = (originalname = '') => {
  const extension = path.extname(originalname).toLowerCase()
  const safeExtension = ['.jpg', '.jpeg', '.png', '.webp'].includes(extension)
    ? extension
    : '.jpg'

  return `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`
}

const storage = isCloudinaryConfigured()
  ? new CloudinaryStorage({
      cloudinary,
      params: async () => {
        return {
          folder: 'products',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [{ width: 800, crop: 'scale' }],
          public_id: `product_${Date.now()}`,
        }
      },
    })
  : multer.diskStorage({
      destination(req, file, cb) {
        ensureUploadsDir()
        cb(null, uploadsDir)
      },
      filename(req, file, cb) {
        cb(null, buildLocalFilename(file.originalname))
      },
    })

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      createAppError('Only JPG, PNG, and WebP images are allowed', 400),
      false
    )
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
})

export const requireCloudinaryUpload = (req, res, next) => {
  return next()
}

export default upload
