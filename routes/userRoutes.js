const express = require("express")
const router = express.Router()
const usersController = require("../controllers/usersController")
const verifyJWT = require("../middleware/verifyJWT")

router.use(verifyJWT)

router.route("/")
    .post(usersController.createNewUser)
    .patch(usersController.updateUserPassword)

module.exports = router
