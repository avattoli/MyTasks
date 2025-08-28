
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
    // 1. Read Authorization header
    const header = req.headers.authorization || "";
  
    // 2. Extract token ("Bearer <token>")
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
  
    try {
      // 3. Verify token
      const payload = jwt.verify(token, process.env.JWT_SECRET);
  
      // 4. Attach payload data to request
      req.user = { id: payload.userId, role: payload.role };
  
      // 5. Continue
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      return res.status(401).json({ error: "Invalid token" });
    }
  }
  
  module.exports = auth;