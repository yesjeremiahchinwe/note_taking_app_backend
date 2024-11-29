const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    authType: {
        type: String,
        default: 'email/password'
    }
})

module.exports = mongoose.model('User', userSchema)