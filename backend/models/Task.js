const { Schema, model } = require("mongoose");

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },

    // Team / board context (optional for personal tasks)
    teamId: { type: Schema.Types.ObjectId, ref: "Team" },
    type: { type: String, enum: ["epic", "story", "task", "bug"], default: "task" },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    order: { type: Number, default: 0 }, // per (teamId,status) ordering
    parentId: { type: Schema.Types.ObjectId, ref: "Task" },

    // People
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // creator/owner
    assigneeId: { type: Schema.Types.ObjectId, ref: "User" },

    // Extras
    labels: { type: [String], default: [] },
    dueDate: { type: Date },
    estimate: { type: Number },
    description: { type: String },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Helpful indexes for board and "My work" queries
taskSchema.index({ teamId: 1, status: 1, order: 1 });
taskSchema.index({ assigneeId: 1, status: 1 });
taskSchema.index({ parentId: 1 });

module.exports = model("Task", taskSchema);
