const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

    console.log(authHeader)

    if (!authHeader?.startsWith('Bearer ')) {
        console.log("Yes! Error started here")
        return res.status(401).json({ message: 'Unauthorized Yes! Error started here', data: `${authHeader}` })
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })
            req.email = decoded.UserInfo.email
            req.userId = decoded.UserInfo.userId
            next()
        }
    )
}

module.exports = verifyJWT 