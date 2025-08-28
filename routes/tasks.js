const express = require("express");
const { list, create, update, remove } = require("../controllers/taskController");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, list);          // GET    /tasks
router.post("/", auth, create);       // POST   /tasks
router.patch("/:id", auth, update);   // PATCH  /tasks/:id
router.delete("/:id", auth, remove);  // DELETE /tasks/:id

module.exports = router;
