const express = require('express');
const router = express.Router();
const validate = require("../middlewares/validate")
const { categoryController } = require("../controllers")
const { categoryValidation } = require("../validations")
const IsAuthenticated = require("../middlewares/authenticate")

router.post("/", validate(categoryValidation.createCategory), IsAuthenticated, categoryController.createCategory);
router.get("/", validate(categoryValidation.listAllCategories), IsAuthenticated, categoryController.listAllCategories);
router.get("/:id", validate(categoryValidation.getCategoryById), IsAuthenticated, categoryController.getCategoryById);
router.patch("/:id", validate(categoryValidation.updateCategory), IsAuthenticated, categoryController.updateCategory);
router.delete("/:id", validate(categoryValidation.deleteCategory), IsAuthenticated, categoryController.deleteCategory);

module.exports = router;


