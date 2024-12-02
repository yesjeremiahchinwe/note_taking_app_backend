const express = require("express")
const router = express.Router()
const notesController = require("../controllers/notesController")
const verifyJWT = require("../middleware/verifyJWT")

router.route("/notes")
    .get(notesController.getAllNotes)
router.route("/notes/archived")
    .get(notesController.getAllArchivedNotes)

router.use(verifyJWT)

router.route("/notes")
    .post(notesController.createNewNote)
    .patch(notesController.updateNote)
    .patch(notesController.markNoteAsArchived)
    .delete(notesController.deleteNote)


module.exports = router