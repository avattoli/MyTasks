const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const COOKIE_NAME = process.env.COOKIE_NAME || "refreshToken";
function getCookieOptions() {
  const rawSameSite = String(process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === "production" ? "none" : "lax")).toLowerCase();
  const sameSite = ["lax", "strict", "none"].includes(rawSameSite) ? rawSameSite : "lax";
  const forceSecure = String(process.env.COOKIE_SECURE || "").toLowerCase();
  const secure = forceSecure === "true" || (forceSecure === "" && (sameSite === "none" || process.env.NODE_ENV === "production"));
  const domain = process.env.COOKIE_DOMAIN;
  return {
    httpOnly: true,
    sameSite,
    secure,
    ...(domain ? { domain } : {}),
    maxAge: 24 * 60 * 60 * 1000
  };
}

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: "username, email, password required" });

    const existingEmail = await User.findOne({ email }); // or username

    if (existingEmail) {
      return res.status(409).json({ error: "Email already registered" }); // 409 = Conflict
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash: hash });

    res.status(201).json({
      id: user._id, username: user.username, email: user.email, createdAt: user.createdAt
    });
  } catch (err) { next(err); }
};

function signToken(user) {
  // put only non-sensitive claims
  return jwt.sign(
    { userId: user._id.toString(), role: user.role }, // payload (claims)
    process.env.JWT_SECRET,                            // secret key
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }  // expiry
  );
}

exports.login = async (req, res, next ) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, getCookieOptions());
    
    return res.status(200).json({
      message: "Logged in",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};
