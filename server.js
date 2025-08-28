require("dotenv").config();
const express = require("express");
const { connectDB } = require("./db");
const cors = require("cors");
const userRoutes = require("./routes/users");
const taskRoutes = require("./routes/tasks");

const app = express();
app.use(express.json());
app.use(cors());
// mount routes
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);

const PORT = process.env.PORT || 3000;
connectDB(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`API on :${PORT}`)))
  .catch(err => { console.error(err); process.exit(1); });
