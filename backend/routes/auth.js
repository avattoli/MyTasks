const express = require("express");
const { requireSession, me } = require("../middleware/auth");
const router = express.Router();

router.get("/me", requireSession, me);

module.exports =  router;