import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { requiredText } from "../utils/validation.js";
const populate = (q) =>
  q.populate("assignee", "name email").populate("project", "name");
export async function listTasks(req, res) {
  const workspaces = await (
    await import("../models/Workspace.js")
  ).default
    .find({ "members.user": req.user.id })
    .select("_id");
  const filter = { workspace: { $in: workspaces.map((w) => w._id) } };
  if (req.query.workspace) {
    if (!workspaces.some((w) => w.id === req.query.workspace))
      return res
        .status(403)
        .json({ message: "You do not have access to this workspace." });
    filter.workspace = req.query.workspace;
  }
  for (const key of ["project", "status", "priority", "assignee"])
    if (req.query[key]) filter[key] = req.query[key];
  if (req.query.search) {
    const term = String(req.query.search)
      .slice(0, 100)
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.title = { $regex: term, $options: "i" };
  }
  res.json(
    await populate(Task.find(filter).sort({ dueDate: 1, updatedAt: -1 })),
  );
}
export async function createTask(req, res) {
  const project = await Project.findById(req.body.project);
  if (!project || project.workspace.toString() !== req.workspace.id)
    return res
      .status(400)
      .json({ message: "Choose a project in this workspace." });
  if (
    req.body.assignee &&
    !req.workspace.members.some((m) => m.user.toString() === req.body.assignee)
  )
    return res
      .status(400)
      .json({ message: "The assignee must be a workspace member." });
  const task = await Task.create({
    workspace: req.workspace.id,
    project: project.id,
    title: requiredText(req.body.title, "Task title", 160),
    description: req.body.description || "",
    assignee: req.body.assignee || undefined,
    priority: req.body.priority || "Medium",
    status: req.body.status || "To Do",
    dueDate: req.body.dueDate || undefined,
  });
  res.status(201).json(await populate(Task.findById(task.id)));
}
export async function updateTask(req, res) {
  const task = await Task.findById(req.params.id);
  if (!task || task.workspace.toString() !== req.workspace.id)
    return res.status(404).json({ message: "Task not found." });
  const isAdmin = req.workspaceRole === "admin";
  if (!isAdmin && task.assignee?.toString() !== req.user.id)
    return res
      .status(403)
      .json({ message: "You can only update tasks assigned to you." });
  if (!isAdmin && Object.keys(req.body).some((k) => k !== "status"))
    return res
      .status(403)
      .json({ message: "Members can update task status only." });
  if (req.body.title !== undefined)
    task.title = requiredText(req.body.title, "Task title", 160);
  for (const field of ["description", "priority", "status", "dueDate"])
    if (req.body[field] !== undefined)
      task[field] = req.body[field] || undefined;
  if (req.body.project !== undefined) {
    const project = await Project.findById(req.body.project);
    if (!project || project.workspace.toString() !== req.workspace.id)
      return res
        .status(400)
        .json({ message: "Choose a project in this workspace." });
    task.project = project.id;
  }
  if (req.body.assignee !== undefined) {
    if (
      req.body.assignee &&
      !req.workspace.members.some(
        (m) => m.user.toString() === req.body.assignee,
      )
    )
      return res
        .status(400)
        .json({ message: "The assignee must be a workspace member." });
    task.assignee = req.body.assignee || undefined;
  }
  await task.save();
  res.json(await populate(Task.findById(task.id)));
}
export async function deleteTask(req, res) {
  if (req.workspaceRole !== "admin")
    return res
      .status(403)
      .json({ message: "Workspace admin access is required." });
  const task = await Task.findOne({
    _id: req.params.id,
    workspace: req.workspace.id,
  });
  if (!task) return res.status(404).json({ message: "Task not found." });
  await task.deleteOne();
  res.json({ message: "Task deleted." });
}
