const crypto = require("crypto");
const slugify = require("slugify");
const Team = require("../models/Team"); // <- single source of truth
const KanbanBoard = require("../models/KanbanBoard");

// Helpers (deduplicated)
function makeJoinCode(len = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid O/0, I/1
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

async function makeUniqueSlug(baseName) {
  const base = slugify(baseName || "team", { lower: true, strict: true }) || "team";
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await Team.exists({ slug })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}
  

  exports.create = async (req, res) => {
    try {

      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
  
      const { teamName } = req.body || {};
      if (!teamName || !teamName.trim()) {
        return res.status(400).json({ error: "teamName is required" });
      }
  
      const slug = await makeUniqueSlug(teamName.trim());
  
      // generate joinCode and retry a couple times if collision (rare)
      let joinCode;
      for (let i = 0; i < 3; i++) {
        joinCode = makeJoinCode(6);
        const clash = await Team.exists({ joinCode });
        if (!clash) break;
        if (i === 2) joinCode = makeJoinCode(8);
      }
      
      const sameNameTeam = await Team.findOne({
        leaderId: userId,
        name: teamName.trim()
      }).collation({ locale: "en", strength: 2 }); 

      if (sameNameTeam) {
        return res.status(400).json({error: "You already lead a team with this name."});
      }
      
      const team = await Team.create({
        name: teamName.trim(),
        slug,
        joinCode,
        leaderId: userId,
      });
      // Auto-create a Kanban board; ignore duplicate errors
      try {
        await KanbanBoard.create({ teamId: team._id });
      } catch (e) {
        if (e?.code !== 11000) console.warn("Kanban auto-create failed:", e.message || e);
      }
  
      return res.status(201).json({
        _id: team._id,
        name: team.name,
        slug: team.slug,
        joinCode: team.joinCode,
        leaderId: team.leaderId,
        createdAt: team.createdAt,
      });
    } catch (err) {
      // handle unique index collisions gracefully
      if (err.code === 11000) {
        return res.status(409).json({ error: "Slug or join code already exists, try again." });
      }
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  };

  exports.join = async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const joinCode = String(req.body?.joinCode || "").trim().toUpperCase();
      if (!joinCode) return res.status(400).json({ error: "joinCode is required" });
  
      const team = await Team.findOne({ joinCode });
      if (!team) return res.status(400).json({ error: "Invalid join code" });
  
      if (String(team.leaderId) === String(userId)) {
        return res.status(409).json({ error: "You are already the leader of this team" });
      }
  
      // Atomic add: only push if user not already a member
      const updated = await Team.findOneAndUpdate(
        { _id: team._id, "members.userId": { $ne: userId } },
        { $push: { members: { userId, role: "MEMBER", status: "ACTIVE" } } },
        { new: true, runValidators: true }
      ).lean();
  
      if (!updated) {
        // Either team vanished or user was already a member (race or duplicate)
        const alreadyIn = await Team.exists({ _id: team._id, "members.userId": userId });
        return res.status(alreadyIn ? 409 : 404).json({
          error: alreadyIn ? "Already a member" : "Team not found"
        });
      } 

      return res.status(200).json({ team: updated });
    } catch (err) {
      console.error("join error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  };
  

  exports.getTeams = async (req, res) => {
    try {
      const userId = req.userId;
  
      // safeguard: check for logged-in user
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized: no userId found, Try logging in again" });
      }
  
      // query teams where user is member or leader
      const teams = await Team.find({
        $or: [
          { "members.userId": userId },
          { leaderId: userId }
        ]
      }).lean();  // returns plain JS objects (lighter for API)
  
      // safeguard: no teams found
      if (!teams || teams.length === 0) {
        return res.status(200).json({ message: "No teams found", teams: [] });
      }
  
      // success
      return res.status(200).json({ teams });
  
    } catch (err) {
      console.error("Error fetching teams:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  
  // Get team members by slug with basic user info
  exports.members = async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { slug } = req.params;
      if (!slug) return res.status(400).json({ error: "slug is required" });

      const team = await Team
        .findOne({ slug, isDeleted: false })
        .populate("leader", "_id username email")
        .populate("members.userId", "_id username email");

      if (!team) return res.status(404).json({ error: "Team not found" });

      const isLeader = String(team.leaderId) === String(userId);
      const isMember = team.members?.some(m => String(m.userId?._id || m.userId) === String(userId));
      if (!isLeader && !isMember) return res.status(403).json({ error: "Forbidden" });

      // Shape a light payload
      const members = (team.members || []).map(m => ({
        user: m.userId && typeof m.userId === 'object' ? {
          _id: m.userId._id,
          username: m.userId.username,
          email: m.userId.email,
        } : { _id: m.userId },
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
      }));

      return res.json({
        team: {
          _id: team._id,
          name: team.name,
          slug: team.slug,
          leader: team.leader ? { _id: team.leader._id, username: team.leader.username, email: team.leader.email } : undefined,
          leaderId: team.leaderId,
          members
        }
      });
    } catch (err) {
      console.error("members error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  };
  
