const User = require("../models/UserModel")
const Note = require("../models/NoteModel")
const sendEmail = require("../config/emailConfig")
const bcrypt = require("bcrypt")

const createNewUser = async (req, res) => {
    const { email, password } = req.body

    // Confirm data
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required"})
    }

    // Check for duplicate email
    const duplicate = await User.findOne({ email }).collation({ locale: "en", strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: "Duplicate email" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const userObject = { email, "password": hashedPassword }
    
    // Create and store new user
    const user = await User.create(userObject)

    // Send the user a welcome email
    // sendEmail(email, "Congratulations! Your account has been created successfully!", "We're are glad to have you join us on Notes - your number one note taking app. Thank you for signing up.")

    if (user) {
        return res.status(201).json({ message: `New user ${email} created`})
    } else {
        return res.status(400).json({ message: "Invalid user data received" })
    }
}


const updateUserPassword = async (req, res) => {
    const { id, oldPassword, newPassword, confirmNewPasword } = req.body

    // Confirm data
    if (!id || !oldPassword || !newPassword || !confirmNewPasword) {
        return res.status(400).json({ message: "All fields are required"})
    }

    // Does the user exist to update?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: "User not found!" })
    }

    const match = await bcrypt.compare(oldPassword, user.password)

    if (!match) return res.status(401).json({ message: 'Invalid Credentials' })

    if (newPassword !== confirmNewPasword) {
        return res.status(401).json({ message: 'Passwords do not match' })
    }

    user.password = await bcrypt.hash(newPassword, 10)

    const updatedUser = await user.save()

    res.json({message: `Password for ${updatedUser.email} updated successfully!`})
}


module.exports = {
    createNewUser,
    updateUserPassword
}