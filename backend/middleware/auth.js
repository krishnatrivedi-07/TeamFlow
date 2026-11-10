import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";

export async function protect(req, res, next) {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  if (!token)
    return res.status(401).json({ message: "Please log in to continue." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user)
      return res.status(401).json({ message: "Account not found." });
    next();
  } catch {
    return res
      .status(401)
      .json({ message: "Session expired. Please log in again." });
  }
}

export async function workspaceAccess(req, res, next) {
  const id =
    req.params.workspaceId || req.body.workspace || req.query.workspace;
  if (!id) return res.status(400).json({ message: "Workspace is required." });
  const workspace = await Workspace.findById(id);
  if (!workspace)
    return res.status(404).json({ message: "Workspace not found." });
  const entry = workspace.members.find(
    (m) => m.user.toString() === req.user.id,
  );
  if (!entry)
    return res
      .status(403)
      .json({ message: "You do not have access to this workspace." });
  req.workspace = workspace;
  req.workspaceRole = entry.role;
  next();
}

export function adminOnly(req, res, next) {
  if (req.workspaceRole !== "admin")
    return res
      .status(403)
      .json({ message: "Workspace admin access is required." });
  next();
}
