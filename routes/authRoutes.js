const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const loginLimiter = require('../middleware/loginLimiter')

router.route("/register")
    .post(authController.createNewUser)

router.route('/login')
    .post(loginLimiter, authController.login)

router.route('/logout')
    .post(authController.logout)

router.route('/forgot')
    .post(authController.forgotPassword)

router.route('/reset')
    .patch(authController.resetPassword)

// router.route('/google')
//     .get(authController.googleRedirect)

// router.route('/callback')
//     .get(authController.callbackGoogle)

module.exports = router