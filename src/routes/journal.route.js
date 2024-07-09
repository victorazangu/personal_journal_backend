const express = require('express');
const router = express.Router();
const validate = require("../middlewares/validate")
const { journalController } = require("../controllers")
const { journalValidation } = require("../validations")
const IsAuthenticated = require("../middlewares/authenticate")

router.post("/", validate(journalValidation.createJournal), IsAuthenticated, journalController.createJournal);
router.get("/categories", validate(journalValidation.listAllCategories), IsAuthenticated, journalController.listAllCategories);
router.get("/categories/:id", validate(journalValidation.listAllJournalEntriesByCategory), IsAuthenticated, journalController.listAllJournalEntriesByCategory);
router.get("/", validate(journalValidation.listAllUsersJournalEntry), IsAuthenticated, journalController.listAllUsersJournalEntry);
router.get("/:id", validate(journalValidation.getJournalEntryById), IsAuthenticated, journalController.getJournalEntryById);
router.patch("/:id", validate(journalValidation.updateJournalEntry), IsAuthenticated, journalController.updateJournalEntry);
router.delete("/:id", validate(journalValidation.deleteJournalEntry), IsAuthenticated, journalController.deleteJournalEntry);

module.exports = router;


