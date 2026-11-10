import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { requiredText } from "../utils/validation.js";

export async function listWorkspaces(req, res) {
  res.json(
    await Workspace.find({ "members.user": req.user.id }).populate(
      "members.user",
      "name email",
    ),
  );
}
export async function createWorkspace(req, res) {
  const workspace = await Workspace.create({
    name: requiredText(req.body.name, "Workspace name", 100),
    description: req.body.description || "",
    members: [{ user: req.user.id, role: "admin" }],
  });
  res.status(201).json(await workspace.populate("members.user", "name email"));
}
export async function getWorkspace(req, res) {
  res.json(await req.workspace.populate("members.user", "name email"));
}
export async function updateWorkspace(req, res) {
  if (req.body.name !== undefined)
    req.workspace.name = requiredText(req.body.name, "Workspace name", 100);
  if (req.body.description !== undefined)
    req.workspace.description = String(req.body.description).slice(0, 500);
  await req.workspace.save();
  res.json(await req.workspace.populate("members.user", "name email"));
}
export async function addMember(req, res) {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(404)
      .json({ message: "No registered user found with that email." });
  if (req.workspace.members.some((m) => m.user.toString() === user.id))
    return res.status(409).json({ message: "This user is already a member." });
  req.workspace.members.push({
    user: user.id,
    role: req.body.role === "admin" ? "admin" : "member",
  });
  await req.workspace.save();
  res
    .status(201)
    .json(await req.workspace.populate("members.user", "name email"));
}
export async function removeMember(req, res) {
  const memberId = req.params.userId;
  if (memberId === req.user.id)
    return res.status(400).json({ message: "You cannot remove yourself." });
  const member = req.workspace.members.find(
    (m) => m.user.toString() === memberId,
  );
  if (!member) return res.status(404).json({ message: "Member not found." });
  if (
    member.role === "admin" &&
    req.workspace.members.filter((m) => m.role === "admin").length === 1
  )
    return res
      .status(400)
      .json({
        message: "Promote another admin before removing the last admin.",
      });
  req.workspace.members = req.workspace.members.filter(
    (m) => m.user.toString() !== memberId,
  );
  await req.workspace.save();
  await Project.updateMany(
    { workspace: req.workspace.id },
    { $pull: { members: memberId } },
  );
  await Task.updateMany(
    { workspace: req.workspace.id, assignee: memberId },
    { $unset: { assignee: 1 } },
  );
  res.json({ message: "Member removed." });
}
export async function dashboard(req, res) {
  const workspaces = await Workspace.find({
    "members.user": req.user.id,
  }).select("_id");
  const ids = workspaces.map((w) => w._id);
  const [projects, tasks, recentProjects, upcomingTasks] = await Promise.all([
    Project.find({ workspace: { $in: ids } })
      .sort({ updatedAt: -1 })
      .lean(),
    Task.find({ workspace: { $in: ids } })
      .populate("assignee", "name")
      .populate("project", "name")
      .lean(),
    Project.find({ workspace: { $in: ids } })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("workspace", "name")
      .lean(),
    Task.find({
      workspace: { $in: ids },
      status: { $ne: "Completed" },
      dueDate: { $gte: new Date() },
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate("project", "name")
      .populate("assignee", "name")
      .lean(),
  ]);
  const now = new Date();
  const projectStats = projects.map((p) => {
    const rows = tasks.filter(
      (t) => String(t.project?._id || t.project) === String(p._id),
    );
    const done = rows.filter((t) => t.status === "Completed").length;
    return {
      ...p,
      progress: rows.length ? Math.round((done / rows.length) * 100) : 0,
    };
  });
  res.json({
    metrics: {
      workspaces: workspaces.length,
      projects: projects.length,
      tasks: tasks.length,
      completed: tasks.filter((t) => t.status === "Completed").length,
      pending: tasks.filter((t) => t.status === "To Do").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      overdue: tasks.filter(
        (t) =>
          t.status !== "Completed" && t.dueDate && new Date(t.dueDate) < now,
      ).length,
    },
    projects: projectStats,
    recentProjects,
    upcomingTasks,
  });
}
