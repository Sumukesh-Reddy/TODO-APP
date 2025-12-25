const Task = require("../models/Task");

exports.addTask = async (req, res) => {
  const task = await Task.create({
    ...req.body,
    userId: req.user.id
  });
  res.json(task);
};

exports.getTasks = async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id });
  res.json(tasks);
};

exports.updateTask = async (req, res) => {
  await Task.findByIdAndUpdate(req.params.id, req.body);
  res.json({ msg: "Updated" });
};

exports.deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
};
