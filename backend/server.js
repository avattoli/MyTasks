require("dotenv").config();
const express = require("express");
const { connectDB } = require("./db");
const cors = require("cors");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const teamRoutes = require("./routes/teams");
const cookieParser = require("cookie-parser");

const app = express();
// Trust reverse proxies (needed for correct protocol and secure cookies on platforms like Render/Heroku)
app.set("trust proxy", 1);
app.use(express.json());

// Configure CORS from environment for deployment flexibility
const rawOrigins = process.env.CORS_ORIGIN || process.env.CLIENT_ORIGIN || "http://localhost:5173";
const allowedOrigins = rawOrigins
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);
const allowAll = allowedOrigins.includes("*");

app.use(cors());


app.use(cookieParser());

// mount routes
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/teams", teamRoutes);

const PORT = process.env.PORT || 3000;
connectDB(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`API on :${PORT}`)))
  .catch(err => { console.error(err); process.exit(1); });
