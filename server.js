require("dotenv").config();
const express = require("express");
const { connectDB } = require("./db");
const cors = require("cors");
const userRoutes = require("./routes/users");
const taskRoutes = require("./routes/tasks");
const authRoutes = require("./routes/auth");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
const corsOptions = {
  origin: "http://localhost:5173",   // your Vite dev URL
  credentials: true,                 // allow cookies/authorization headers
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(cookieParser());
// mount routes
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;
connectDB(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`API on :${PORT}`)))
  .catch(err => { console.error(err); process.exit(1); });
