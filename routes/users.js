const express = require("express");
const { signup, login, me } = require("../controllers/userController");
const router = express.Router();

router.post("/signup", signup);       // POST /users (signup)
router.get("/login", login);

module.exports = router;
