const mongoose = require("mongoose");

function redactUri(u = "") {
  try {
    const url = new URL(u);
    if (url.password) url.password = "***";
    return url.toString();
  } catch {
    return u.replace(/:\S+@/, ":***@");
  }
}

async function connectDB(uri) {
  const dbName = process.env.MONGODB_DB_NAME;
  mongoose.set("strictQuery", true);
  const opts = {
    ...(dbName ? { dbName } : {}),
    // keep conservative, configurable via env if needed
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
    serverSelectionTimeoutMS: Number(process.env.MONGODB_TIMEOUT_MS || 10000),
    // Align with MongoDB Stable API like the raw driver example
    serverApi: { version: '1', strict: true, deprecationErrors: true },
  };
  try {
    await mongoose.connect(uri, opts);
    // Optional ping (mirrors the MongoClient example)
    try {
      await mongoose.connection.db.admin().command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (e) {
      console.warn("Ping failed (continuing):", e?.message || e);
    }
    const { host, port, name } = mongoose.connection;
    console.log(`MongoDB connected: ${host}:${port}/${name}`);
  } catch (err) {
    console.error("MongoDB connection error:", err?.message || err);
    console.error("Tried URI:", redactUri(uri), dbName ? `(dbName=${dbName})` : "");
    throw err;
  }
}

module.exports = { connectDB };
