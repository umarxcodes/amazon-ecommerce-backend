/*
📁 FILE: build-test-app.js
📌 PURPOSE: Creates a minimal Express app for route-level tests so each suite
can mount one router with the real error middleware.
========================================
*/

import express from 'express'
import errorHandler from '../../middleware/error.middleware.js'

/* ===== BUILD TEST APP FUNCTION ===== */
/* Mounts a router under a path and wires the global error handler. */
export const buildTestApp = (mountPath, router) => {
  const app = express()
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(mountPath, router)
  app.use(errorHandler)
  return app
}
