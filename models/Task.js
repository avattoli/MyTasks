const { Schema, model } = require("mongoose");

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = model("Task", taskSchema);
