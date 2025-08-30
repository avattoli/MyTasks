const Team = require("../models/Team");
const KanbanBoard = require("../models/KanbanBoard");

function isLeader(userId, team) {
  return String(team.leaderId) === String(userId);
}
function isMember(userId, team) {
  return Array.isArray(team.members) && team.members.some(m => String(m.userId) === String(userId));
}
function isAdmin(userId, team) {
  return Array.isArray(team.members) && team.members.some(m => String(m.userId) === String(userId) && m.role === "ADMIN");
}

exports.getBoard = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const team = await Team.findOne({ slug }).lean();
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (!isLeader(req.userId, team) && !isMember(req.userId, team)) return res.status(403).json({ error: "Forbidden" });

    const board = await KanbanBoard.findOne({ teamId: team._id }).lean();
    if (!board) return res.status(404).json({ error: "Board not found" });
    return res.json({ board });
  } catch (err) { next(err); }
};

exports.createBoard = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const team = await Team.findOne({ slug }).lean();
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (!isLeader(req.userId, team) && !isAdmin(req.userId, team)) return res.status(403).json({ error: "Forbidden" });

    const existing = await KanbanBoard.findOne({ teamId: team._id });
    if (existing) return res.status(200).json({ board: existing });

    const board = await KanbanBoard.create({ teamId: team._id });
    return res.status(201).json({ board });
  } catch (err) { next(err); }
};

exports.updateBoard = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    const team = await Team.findOne({ slug }).lean();
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (!isLeader(req.userId, team) && !isAdmin(req.userId, team)) return res.status(403).json({ error: "Forbidden" });

    const { maxTasks, columns } = req.body || {};
    const set = {};
    if (typeof maxTasks === 'number') set.maxTasks = Math.max(0, maxTasks);
    if (Array.isArray(columns)) {
      // update by key: only name/wipLimit
      const board = await KanbanBoard.findOne({ teamId: team._id });
      if (!board) return res.status(404).json({ error: "Board not found" });
      for (const patch of columns) {
        const col = board.columns.find(c => c.key === patch.key);
        if (!col) continue;
        if (typeof patch.name === 'string') col.name = patch.name;
        if (typeof patch.wipLimit === 'number') col.wipLimit = Math.max(0, patch.wipLimit);
      }
      if (typeof maxTasks === 'number') board.maxTasks = Math.max(0, maxTasks);
      await board.save();
      return res.json({ board });
    }

    const updated = await KanbanBoard.findOneAndUpdate(
      { teamId: team._id },
      { $set: set },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Board not found" });
    return res.json({ board: updated });
  } catch (err) { next(err); }
};

