const express = require("express")
const router = express.Router()
const notesController = require("../controllers/notesController")
const verifyJWT = require("../middleware/verifyJWT")

router.use(verifyJWT)

router.route("/:userId")
    .get(notesController.getAllNotes)

router.route("/")
    .post(notesController.createNewNote)
    .put(notesController.updateNote)
    .patch(notesController.markNoteAsArchived)
    .delete(notesController.deleteNote)

router.route("/archived/:userId")
    .get(notesController.getAllArchivedNotes)

router.route("/restore")
    .patch(notesController.restoreArchivedNote)


module.exports = router