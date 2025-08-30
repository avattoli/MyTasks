const express = require("express");
const { create, getTeams, join, members } = require("../controllers/teamController");
const board = require("../controllers/boardController");
const sprint = require("../controllers/sprintController");
const { createForTeam, listForTeam, updateForTeam, removeForTeam } = require("../controllers/taskController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post('/create', auth.requireSession, create);
router.get('/getTeams', auth.requireSession, getTeams);
router.post('/join', auth.requireSession, join);
router.get('/:slug/members', auth.requireSession, members);
router.post('/:slug/tasks', auth.requireSession, createForTeam);
router.get('/:slug/tasks', auth.requireSession, listForTeam);
router.patch('/:slug/tasks/:id', auth.requireSession, updateForTeam);
router.delete('/:slug/tasks/:id', auth.requireSession, removeForTeam);
// Board routes
router.get('/:slug/board', auth.requireSession, board.getBoard);
router.post('/:slug/board', auth.requireSession, board.createBoard);
router.patch('/:slug/board', auth.requireSession, board.updateBoard);
// Sprint routes
router.get('/:slug/sprints', auth.requireSession, sprint.listForTeam);
router.post('/:slug/sprints', auth.requireSession, sprint.createForTeam);
router.patch('/:slug/sprints/:id', auth.requireSession, sprint.updateForTeam);
router.delete('/:slug/sprints/:id', auth.requireSession, sprint.removeForTeam);
router.post('/:slug/sprints/:id/tasks', auth.requireSession, sprint.addTask);
router.get('/:slug/sprints/:id/tasks', auth.requireSession, sprint.listTasks);
router.delete('/:slug/sprints/:id/tasks/:taskId', auth.requireSession, sprint.removeTask);
module.exports = router;
