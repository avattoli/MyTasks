const express = require("express");
const { create, getTeams, join } = require("../controllers/teamController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post('/create', auth.requireSession, create);
router.get('/getTeams', auth.requireSession, getTeams);
router.post('/join', auth.requireSession, join);
module.exports = router;
