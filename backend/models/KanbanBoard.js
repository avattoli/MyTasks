const { Schema, model } = require("mongoose");

// One Kanban board per team. Stores columns and ordered task ids.
const columnSchema = new Schema(
  {
    key: { type: String, required: true, trim: true }, // e.g. 'todo', 'in_progress', 'done'
    name: { type: String, required: true, trim: true },
    wipLimit: { type: Number },
    taskIds: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  },
  { _id: false }
);

const kanbanBoardSchema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, unique: true },
    maxTasks: { type: Number, default: 4 },
    columns: {
      type: [columnSchema],
      default: [
        { key: "todo", name: "To Do", taskIds: [] },
        { key: "in_progress", name: "In Progress", taskIds: [] },
        { key: "done", name: "Done", taskIds: [] },
      ],
    },
  },
  { timestamps: true }
);

kanbanBoardSchema.index({ teamId: 1 }, { unique: true });

module.exports = model("KanbanBoard", kanbanBoardSchema);
