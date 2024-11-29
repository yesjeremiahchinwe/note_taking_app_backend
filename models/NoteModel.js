const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        title: {
            type: String,
            required: true,
            unique: true
        },
        tags: {
            type: [String],
            required: true,
            default: [""]
        },
        content: {
            type: String,
            required: true
        },
        isArchived: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Note', noteSchema)