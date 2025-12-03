const express = require("express")
const rateLimit = require("express-rate-limit")

const { aiController } = require("../controllers/ai.controller")

const router = express.Router()

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: "Too many AI requests. Please slow down."
})

router.route("/generate").post(limiter, aiController)

module.exports = router
