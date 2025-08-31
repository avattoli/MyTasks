
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const COOKIE_NAME = process.env.COOKIE_NAME || "refreshToken";

  exports.requireSession = (req, res, next) => {
    const token = req.cookies[COOKIE_NAME]; // cookie-based session token
    if (!token) return res.status(401).json({ error: "Not logged in" });
  
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = payload.userId;             // set for later handlers
      return next();
    } catch {
      return res.status(401).json({ error: "Invalid/expired session" });
    }
  }
  

exports.me = async (req, res) => {
    const user = await User.findById(req.userId).select("_id username email");
    res.json({ user });
  }
