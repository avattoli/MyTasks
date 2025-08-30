const Team = require("../models/Team");
const Sprint = require("../models/Sprint");

function isLeader(userId, team) {
  return String(team.leaderId) === String(userId);
}
function isMember(userId, team) {
  return Array.isArray(team.members) && team.members.some(m => String(m.userId) === String(userId));
}
function isAdmin(userId, team) {
  return Array.isArray(team.members) && team.members.some(m => String(m.userId) === String(userId) && m.role === "ADMIN");
}

exports.listForTeam = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const team = await Team.findOne({ slug }).lean();
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (!isLeader(req.userId, team) && !isMember(req.userId, team)) return res.status(403).json({ error: "Forbidden" });

    const sprints = await Sprint.find({ teamId: team._id }).sort({ status: 1, order: 1, createdAt: 1 }).lean();
    return res.json({ sprints });
  } catch (err) { next(err); }
};

exports.createForTeam = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const team = await Team.findOne({ slug }).lean();
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (!isLeader(req.userId, team) && !isAdmin(req.userId, team)) return res.status(403).json({ error: "Forbidden" });

    const { name, goal, startDate, endDate, status } = req.body || {};
    if (!name || !name.trim()) return res.status(400).json({ error: "name is required" });

    const sprint = await Sprint.create({
      teamId: team._id,
      name: name.trim(),
      goal,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
    });
    return res.status(201).json(sprint);
  } catch (err) { next(err); }
};

exports.updateForTeam = async (req, res, next) => {
  try {
    const { slug, id } = req.params;
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const team = await Team.findOne({ slug }).lean();
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (!isLeader(req.userId, team) && !isAdmin(req.userId, team)) return res.status(403).json({ error: "Forbidden" });

    const allowed = (({ name, goal, startDate, endDate, status, order }) => ({ name, goal, startDate, endDate, status, order }))(req.body || {});
    if (allowed.name) allowed.name = String(allowed.name).trim();
    if (allowed.startDate) allowed.startDate = new Date(allowed.startDate);
    if (allowed.endDate) allowed.endDate = new Date(allowed.endDate);

    const updated = await Sprint.findOneAndUpdate({ _id: id, teamId: team._id }, allowed, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (err) { next(err); }
};

exports.removeForTeam = async (req, res, next) => {
  try {
    const { slug, id } = req.params;
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const team = await Team.findOne({ slug }).lean();
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (!isLeader(req.userId, team) && !isAdmin(req.userId, team)) return res.status(403).json({ error: "Forbidden" });

    const r = await Sprint.findOneAndDelete({ _id: id, teamId: team._id });
    if (!r) return res.status(404).json({ error: "Not found" });
    return res.status(204).end();
  } catch (err) { next(err); }
};

// Add a task to a sprint (leader/admin)
exports.addTask = async (req, res, next) => {
  try {
    const { slug, id } = req.params; // id = sprint id
    const { taskId } = req.body || {};
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    if (!taskId) return res.status(400).json({ error: "taskId is required" });
    const team = await Team.findOne({ slug }).lean();
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (!isLeader(req.userId, team) && !isAdmin(req.userId, team)) return res.status(403).json({ error: "Forbidden" });

    // Ensure sprint belongs to team
    const sprint = await Sprint.findOne({ _id: id, teamId: team._id });
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    // Sanity: ensure task belongs to same team
    const Task = require("../models/Task");
    const task = await Task.findOne({ _id: taskId, teamId: team._id }).lean();
    if (!task) return res.status(404).json({ error: "Task not found" });

    await Sprint.updateOne({ _id: sprint._id }, { $addToSet: { taskIds: task._id } });
    const updated = await Sprint.findById(sprint._id).lean();
    return res.json({ sprint: updated });
  } catch (err) { next(err); }
};

// List tasks for a sprint (members can view)
exports.listTasks = async (req, res, next) => {
  try {
    const { slug, id } = req.params; // sprint id
    const { status } = req.query || {};
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const team = await Team.findOne({ slug }).lean();
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (!isLeader(req.userId, team) && !isMember(req.userId, team)) return res.status(403).json({ error: "Forbidden" });

    const sprint = await Sprint.findOne({ _id: id, teamId: team._id }).lean();
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    const Task = require("../models/Task");
    const q = { teamId: team._id, _id: { $in: sprint.taskIds || [] } };
    if (status) q.status = status;
    const tasks = await Task.find(q).sort({ status: 1, order: 1, createdAt: 1 }).lean();
    return res.json({ tasks });
  } catch (err) { next(err); }
};

// Remove a task from a sprint (leader/admin)
exports.removeTask = async (req, res, next) => {
  try {
    const { slug, id, taskId } = req.params;
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const team = await Team.findOne({ slug }).lean();
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (!isLeader(req.userId, team) && !isAdmin(req.userId, team)) return res.status(403).json({ error: "Forbidden" });

    const sprint = await Sprint.findOne({ _id: id, teamId: team._id });
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    await Sprint.updateOne({ _id: sprint._id }, { $pull: { taskIds: taskId } });
    return res.status(204).end();
  } catch (err) { next(err); }
};
