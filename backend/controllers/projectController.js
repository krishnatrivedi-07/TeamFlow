import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { requiredText } from "../utils/validation.js";
const workspaceQuery = (workspace) => ({ workspace });
export async function listProjects(req, res) {
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
  const projects = await Project.find(filter)
    .populate("workspace", "name")
    .populate("members", "name email")
    .sort({ updatedAt: -1 });
  const result = await Promise.all(
    projects.map(async (p) => {
      const total = await Task.countDocuments({ project: p.id });
      const done = await Task.countDocuments({
        project: p.id,
        status: "Completed",
      });
      return {
        ...p.toObject(),
        progress: total ? Math.round((done / total) * 100) : 0,
        taskCount: total,
      };
    }),
  );
  res.json(result);
}
export async function createProject(req, res) {
  const members = (req.body.members || []).map(String);
  if (
    members.some(
      (id) => !req.workspace.members.some((m) => m.user.toString() === id),
    )
  )
    return res
      .status(400)
      .json({ message: "Every project member must belong to this workspace." });
  const project = await Project.create({
    workspace: req.workspace.id,
    name: requiredText(req.body.name, "Project name", 120),
    description: req.body.description || "",
    startDate: req.body.startDate || undefined,
    deadline: req.body.deadline || undefined,
    status: req.body.status || "Planning",
    members,
  });
  res.status(201).json(await project.populate("members", "name email"));
}
async function findProject(req, res, next) {
  const project = await Project.findById(req.params.id).populate(
    "members",
    "name email",
  );
  if (!project) return res.status(404).json({ message: "Project not found." });
  const membership = req.workspace.members.some(
    (m) => m.user.toString() === req.user.id,
  );
  if (!membership || project.workspace.toString() !== req.workspace.id)
    return res.status(403).json({ message: "You cannot access this project." });
  req.project = project;
  next();
}
export { findProject };
export async function getProject(req, res) {
  const tasks = await Task.find({ project: req.project.id })
    .populate("assignee", "name email")
    .sort({ dueDate: 1 });
  res.json({
    ...req.project.toObject(),
    tasks,
    progress: tasks.length
      ? Math.round(
          (tasks.filter((t) => t.status === "Completed").length /
            tasks.length) *
            100,
        )
      : 0,
  });
}
export async function updateProject(req, res) {
  if (req.body.name !== undefined)
    req.project.name = requiredText(req.body.name, "Project name", 120);
  for (const field of ["description", "status", "startDate", "deadline"])
    if (req.body[field] !== undefined)
      req.project[field] = req.body[field] || undefined;
  if (req.body.members) {
    if (
      req.body.members.some(
        (id) =>
          !req.workspace.members.some((m) => m.user.toString() === String(id)),
      )
    )
      return res
        .status(400)
        .json({
          message: "Every project member must belong to this workspace.",
        });
    req.project.members = req.body.members;
  }
  await req.project.save();
  res.json(await req.project.populate("members", "name email"));
}
export async function deleteProject(req, res) {
  await Task.deleteMany({ project: req.project.id });
  await req.project.deleteOne();
  res.json({ message: "Project and its tasks deleted." });
}
