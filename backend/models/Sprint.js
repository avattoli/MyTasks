const { Schema, model } = require("mongoose");

const sprintSchema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    name: { type: String, required: true, trim: true },
    goal: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ["planned", "active", "completed"], default: "planned" },
    order: { type: Number, default: 0 },
    taskIds: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  },
  { timestamps: true }
);

sprintSchema.index({ teamId: 1, status: 1, order: 1 });

module.exports = model("Sprint", sprintSchema);

