const Task = require("../models/Task");
const Team = require("../models/Team");
const KanbanBoard = require("../models/KanbanBoard");


// Create a task for a given team slug
// Requires: req.params.slug, req.userId, body.title
exports.createForTeam = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { title, status, type, priority, labels } = req.body || {};

    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    if (!slug || !slug.trim()) return res.status(400).json({ error: "slug is required" });
    if (!title || !title.trim()) return res.status(400).json({ error: "title is required" });

    const team = await Team.findOne({ slug }).lean();
    if (!team) return res.status(404).json({ error: "Team not found" });

    // Only leader or ADMIN members can create
    const isLeader = String(team.leaderId) === String(req.userId);
    const isAdmin = Array.isArray(team.members) && team.members.some(m => String(m.userId) === String(req.userId) && m.role === "ADMIN");
    if (!isLeader && !isAdmin) return res.status(403).json({ error: "Forbidden: leader or admin required" });

    // Enforce board maxTasks ONLY for tasks placed on the board (labels includes 'board')
    const isBoardTask = Array.isArray(labels) && labels.includes('board');
    if (isBoardTask) {
      let board = await KanbanBoard.findOne({ teamId: team._id });
      if (!board) {
        try { board = await KanbanBoard.create({ teamId: team._id }); } catch {}
      }
      const maxTasks = board?.maxTasks ?? 4;
      const currentCount = await Task.countDocuments({ teamId: team._id, labels: 'board' });
      if (currentCount >= maxTasks) {
        return res.status(409).json({ error: `Board limit reached (${maxTasks} tasks)` });
      }
    }

    const task = await Task.create({
      title: title.trim(),
      status,
      type,
      priority,
      teamId: team._id,
      userId: req.userId,
      ...(Array.isArray(labels) ? { labels } : {})
    });

    return res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// List tasks for a given team slug (any member can view)
exports.listForTeam = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const team = await Team.findOne({ slug }).lean();
    if (!team) return res.status(404).json({ error: "Team not found" });

    const isLeader = String(team.leaderId) === String(req.userId);
    const isMember = Array.isArray(team.members) && team.members.some(m => String(m.userId) === String(req.userId));
    if (!isLeader && !isMember) return res.status(403).json({ error: "Forbidden" });

    const { status, type, assigneeId } = req.query || {};
    const q = { teamId: team._id };
    if (status) q.status = status;
    if (type) q.type = type;
    if (assigneeId) q.assigneeId = assigneeId;

    const tasks = await Task.find(q).sort({ order: 1, createdAt: 1 }).lean();
    return res.json({ tasks });
  } catch (err) { next(err); }
};

// Update a task within a team (leader or admin)
exports.updateForTeam = async (req, res, next) => {
  try {
    const { slug, id } = req.params;
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const team = await Team.findOne({ slug }).lean();
    if (!team) return res.status(404).json({ error: "Team not found" });
    const isLeader = String(team.leaderId) === String(req.userId);
    const isAdmin = Array.isArray(team.members) && team.members.some(m => String(m.userId) === String(req.userId) && m.role === "ADMIN");
    if (!isLeader && !isAdmin) return res.status(403).json({ error: "Forbidden" });

    const allowed = (({ title, status, type, priority, order, assigneeId, labels, dueDate, estimate, description, archivedAt }) => ({ title, status, type, priority, order, assigneeId, labels, dueDate, estimate, description, archivedAt }))(req.body || {});

    // If adding to board via labels change, enforce maxTasks
    if (Array.isArray(allowed.labels)) {
      const existing = await Task.findOne({ _id: id, teamId: team._id }).lean();
      if (!existing) return res.status(404).json({ error: "Not found" });
      const hadBoard = Array.isArray(existing.labels) && existing.labels.includes('board');
      const willHaveBoard = allowed.labels.includes('board');
      if (!hadBoard && willHaveBoard) {
        let board = await KanbanBoard.findOne({ teamId: team._id });
        if (!board) {
          try { board = await KanbanBoard.create({ teamId: team._id }); } catch {}
        }
        const maxTasks = board?.maxTasks ?? 4;
        const currentCount = await Task.countDocuments({ teamId: team._id, labels: 'board' });
        if (currentCount >= maxTasks) {
          return res.status(409).json({ error: `Board limit reached (${maxTasks} tasks)` });
        }
      }
    }

    const updated = await Task.findOneAndUpdate(
      { _id: id, teamId: team._id },
      allowed,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (err) { next(err); }
};

// Remove a task within a team (leader or admin)
exports.removeForTeam = async (req, res, next) => {
  try {
    const { slug, id } = req.params;
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const team = await Team.findOne({ slug }).lean();
    if (!team) return res.status(404).json({ error: "Team not found" });
    const isLeader = String(team.leaderId) === String(req.userId);
    const isAdmin = Array.isArray(team.members) && team.members.some(m => String(m.userId) === String(req.userId) && m.role === "ADMIN");
    if (!isLeader && !isAdmin) return res.status(403).json({ error: "Forbidden" });

    const r = await Task.findOneAndDelete({ _id: id, teamId: team._id });
    if (!r) return res.status(404).json({ error: "Not found" });
    return res.status(204).end();
  } catch (err) { next(err); }
};
