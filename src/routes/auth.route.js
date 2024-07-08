const express = require('express');
const router = express.Router();
const validate = require("../middlewares/validate")
const { authController } = require("../controllers")
const { authValidation } = require("../validations")
const IsAuthenticated = require("../middlewares/authenticate")

router.get("/", authController.index);
router.post("/register", validate(authValidation.register), authController.register);
router.post("/login", validate(authValidation.login), authController.login);
router.get("/profile", IsAuthenticated, authController.profile);


module.exports = router;


