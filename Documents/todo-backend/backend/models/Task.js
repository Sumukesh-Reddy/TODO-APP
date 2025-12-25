const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    description: String,
    deadline: Date,
    priority: { type: Number, enum: [1, 2, 3] },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
