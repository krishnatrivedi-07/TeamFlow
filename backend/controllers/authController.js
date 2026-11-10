import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import { requiredText } from "../utils/validation.js";

const issue = (user) => ({
  token: jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" }),
  user: { id: user.id, name: user.name, email: user.email },
});
export async function register(req, res) {
  const name = requiredText(req.body.name, "Name", 80);
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const password = req.body.password;
  if (!/^\S+@\S+\.\S+$/.test(email))
    return res.status(400).json({ message: "Enter a valid email address." });
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 72
  )
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters." });
  if (await User.exists({ email }))
    return res
      .status(409)
      .json({ message: "An account with that email already exists." });
  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
  });
  const workspaceName = `${name.split(" ")[0]}'s workspace`;
  await Workspace.create({
    name: workspaceName,
    members: [{ user: user.id, role: "admin" }],
  });
  res.status(201).json(issue(user));
}
export async function login(req, res) {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const user = await User.findOne({ email }).select("+password");
  if (
    !user ||
    !(await bcrypt.compare(String(req.body.password || ""), user.password))
  )
    return res.status(401).json({ message: "Email or password is incorrect." });
  res.json(issue(user));
}
export async function me(req, res) {
  res.json({
    user: { id: req.user.id, name: req.user.name, email: req.user.email },
  });
}
export async function updateProfile(req, res) {
  if (req.body.name) req.user.name = requiredText(req.body.name, "Name", 80);
  if (req.body.email) {
    const email = String(req.body.email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email))
      return res.status(400).json({ message: "Enter a valid email address." });
    if (await User.exists({ email, _id: { $ne: req.user.id } }))
      return res.status(409).json({ message: "That email is already in use." });
    req.user.email = email;
  }
  await req.user.save();
  res.json({
    user: { id: req.user.id, name: req.user.name, email: req.user.email },
  });
}
