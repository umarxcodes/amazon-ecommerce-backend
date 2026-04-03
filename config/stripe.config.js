import Stripe from 'stripe'
import { env } from './env.config.js'

const stripe = env.stripeSecretKey
  ? new Stripe(env.stripeSecretKey)
  : null

export default stripe
