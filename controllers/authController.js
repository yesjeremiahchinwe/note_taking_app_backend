const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { sendEmail } = require("../config/emailConfig")
const User = require("../models/UserModel")

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const foundUser = await User.findOne({ email }).exec()

    if (!foundUser) {
        return res.status(401).json({ message: 'Invalid Credentials' })
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) return res.status(401).json({ message: 'Invalid Credentials' })

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "email": foundUser.email,
                "userId": foundUser._id
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '5m' }
    )

    const refreshToken = jwt.sign(
        { "email": foundUser.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '20m' }
    )

    // Create secure cookie with refresh token 
    res.cookie('jwt', refreshToken, {
        httpOnly: true, //accessible only by web server 
        secure: true, //https
        sameSite: 'None', //cross-site cookie 
        // maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
        maxAge: 1200 * 1000 //cookie expiry: set to match rT
    })

    // Send accessToken containing username and roles 
    res.json({ accessToken })
}

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundUser = await User.findOne({ email: decoded.email }).exec()

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "email": foundUser.email,
                        "userId": foundUser._id
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '5m' }
            )

            res.json({ accessToken })
        }
    )
}

// @desc Forgot Password
// @route GET /auth/forgot-password
// @access Public
const forgotPassword = async (req, res) => {
    const { email } = req.body

    const foundUser = await User.findOne({ email }).exec()

    if (!foundUser) {
        return res.status(401).json({ message: 'Invalid Credentials' })
    }

    sendEmail(email, "Reset Your Password", `Hello ${foundUser.email}! Kindly click the link below to reset your password <a href="${process.env.FRONTEND_URL}/${foundUser._id}/reset-password"></a>`)
}

// @desc ResetPassword
// @route POST /auth/reset-password
// @access Public
const resetPassword = async (req, res) => {
    const { userId, newPassword, confirmNewPassword } = req.body

    const foundUser = await User.findOne({ _id: userId }).exec()

    if (!foundUser) {
        return res.status(401).json({ message: 'User Not Found' })
    }

    if (newPassword !== confirmNewPassword) {
        return res.status(401).json({ message: 'Passwords do not match' })
    }

     // Hash password
     foundUser.password = await bcrypt.hash(newPassword, 10)

     const updatedUser = await foundUser.save()

     sendEmail(updatedUser.email, "Password Reset Successful!", `Hi ${updatedUser.email}! You recently reset your password for the account ${updatedUser.email}. Please if you're not the one, we suggest you change your password on the settings page.`)
 
     res.json({message: `Password reset for ${updatedUser.email} successful!`})
}

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) //No content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Logged out successfully!' })
}

module.exports = {
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword
}