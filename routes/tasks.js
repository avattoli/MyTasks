const express = require("express");
const { list, create, update, remove } = require("../controllers/taskController");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", auth.requireSession, list);          // GET    /tasks
router.post("/", auth.requireSession, create);       // POST   /tasks
router.patch("/:id", auth.requireSession, update);   // PATCH  /tasks/:id
router.delete("/:id", auth.requireSession, remove);  // DELETE /tasks/:id

module.exports = router;
