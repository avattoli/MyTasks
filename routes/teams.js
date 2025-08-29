const express = require("express");
const { create } = require("../controllers/teamController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post('/create', auth.requireSession, create);

module.exports = router;
