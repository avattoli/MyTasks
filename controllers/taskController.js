const Task = require("../models/Task");

exports.list = async (req, res, next) => {
  try {
    const { status } = req.query;
    const q = { userId: req.user.id, ...(status ? { status } : {}) };
    const tasks = await Task.find(q).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, status } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });

    const task = await Task.create({ title, status, userId: req.user.id });
    res.status(201).json(task);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const r = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!r) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (err) { next(err); }
};
