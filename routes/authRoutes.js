const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const loginLimiter = require('../middleware/loginLimiter')

router.route("/register")
    .post(authController.createNewUser)

router.route('/login')
    .post(loginLimiter, authController.login)

router.route('/refresh-token')
    .post(loginLimiter, authController.refreshToken)

// Frontend starts Google login here
router.route('/google')
    .get(authController.googleAuth)

// Google redirects back here after login
router.route('/google/callback')
    .get(authController.googleCallback)

// Google redirects back to login on failure
router.route('/failed')
    .get(authController.googleAuthFailed)

router.route('/logout')
    .post(authController.logout)

router.route('/forgot')
    .post(authController.forgotPassword)

router.route('/reset')
    .patch(authController.resetPassword)

module.exports = router