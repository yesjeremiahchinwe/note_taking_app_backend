const express = require("express")
const router = express.Router()
const usersController = require("../controllers/usersController")
const verifyJWT = require("../middleware/verifyJWT")

router.route("/users")
    .post(usersController.createNewUser)

router.use(verifyJWT)

router.route("/users")
    .patch(usersController.updateUserPassword)

module.exports = router
