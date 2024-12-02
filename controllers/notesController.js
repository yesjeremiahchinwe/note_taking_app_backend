const Note = require("../models/NoteModel");
const User = require("../models/UserModel");

const getAllNotes = async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.userId) return res.status(401).json({ message: 'Unauthorized' })

    const userId = cookies.userId

    const notes = await Note.find({ user: userId }).lean()

    if (!notes?.length) {
        return res.status(400).json({ message: "No notes found" })
    }

    res.status(200).json(notes)
}

const getAllArchivedNotes = async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.userId) return res.status(401).json({ message: 'Unauthorized' })

    const userId = cookies.userId

    const notes = await Note.find({ user: userId, isArchived: true }).lean()

    if (!notes?.length) {
        return res.status(400).json({ message: "No notes found" })
    }

    res.status(200).json(notes)
}

const createNewNote = async (req, res) => {
    const { userId, title, tags, content } = req.body

    // Confirm data
    if (!userId || !title || !tags || !content) {
        return res.status(400).json({ message: "All fields are required" })
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).collation({ locale: "en", strength: 2}).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: "Duplicate note title" })
    }

    // Create and store the new user
    const note = await Note.create({ userId, title, tags, content })

    if (note) {
        return res.status(201).json({ message: "New note created" })
    } else {
        return res.status(400).json({ message: "Invalid note data received" })
    }
}


const updateNote = async (req, res) => {
    const { id, userId, title, tags, content } = req.body

    // Confirm data
    if (!id || !userId || !title || !tags || !content) {
        return res.status(400).json({ message: "All fields are required" })
    }

    // Confirm note exists to update
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: "Note not found" })
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).collation({ locale: "en", strength: 2 }).lean().exec()

    // Allow renaming of the original note
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: "Duplicate note title" })
    }

    note.user = userId
    note.title = title
    note.tags = tags
    note.content = content

    const updatedNote = await note.save()

    res.json(`'${updatedNote.title}' updated`)
}

const markNoteAsArchived = async (req, res) => {
    const { id } = req.body
    
    // Confirm data
    if (!id) {
        return res.status(400).json({ message: "Note ID required" })
    }

    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: "Note not found" })
    }

    note.isArchived = true

    const updatedNote = await note.save()

    res.json(`'${updatedNote.title}' archived!`)
}


const deleteNote = async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: "Note ID required" })
    }

    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: "Note not found" })
    }

    const deletedNote = await note.deleteOne()

    res.json({ message: `Note '${deletedNote.title}' with ID '${deletedNote._id}' deleted`})
}


module.exports = {
    getAllNotes,
    getAllArchivedNotes,
    createNewNote,
    updateNote,
    deleteNote,
    markNoteAsArchived
}
