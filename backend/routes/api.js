import { Router } from "express";
import { asyncRoute } from "../utils/asyncRoute.js";
import { protect, workspaceAccess, adminOnly } from "../middleware/auth.js";
import * as auth from "../controllers/authController.js";
import * as ws from "../controllers/workspaceController.js";
import * as projects from "../controllers/projectController.js";
import * as tasks from "../controllers/taskController.js";
const router = Router();
router.post("/auth/register", asyncRoute(auth.register));
router.post("/auth/login", asyncRoute(auth.login));
router.get("/auth/me", protect, asyncRoute(auth.me));
router.patch("/auth/profile", protect, asyncRoute(auth.updateProfile));
router.get("/dashboard", protect, asyncRoute(ws.dashboard));
router.get("/workspaces", protect, asyncRoute(ws.listWorkspaces));
router.post("/workspaces", protect, asyncRoute(ws.createWorkspace));
router.get(
  "/workspaces/:workspaceId",
  protect,
  workspaceAccess,
  asyncRoute(ws.getWorkspace),
);
router.patch(
  "/workspaces/:workspaceId",
  protect,
  workspaceAccess,
  adminOnly,
  asyncRoute(ws.updateWorkspace),
);
router.post(
  "/workspaces/:workspaceId/members",
  protect,
  workspaceAccess,
  adminOnly,
  asyncRoute(ws.addMember),
);
router.delete(
  "/workspaces/:workspaceId/members/:userId",
  protect,
  workspaceAccess,
  adminOnly,
  asyncRoute(ws.removeMember),
);
router.get("/projects", protect, asyncRoute(projects.listProjects));
router.post(
  "/workspaces/:workspaceId/projects",
  protect,
  workspaceAccess,
  adminOnly,
  asyncRoute(projects.createProject),
);
router.get(
  "/workspaces/:workspaceId/projects/:id",
  protect,
  workspaceAccess,
  asyncRoute(projects.findProject),
  asyncRoute(projects.getProject),
);
router.patch(
  "/workspaces/:workspaceId/projects/:id",
  protect,
  workspaceAccess,
  adminOnly,
  asyncRoute(projects.findProject),
  asyncRoute(projects.updateProject),
);
router.delete(
  "/workspaces/:workspaceId/projects/:id",
  protect,
  workspaceAccess,
  adminOnly,
  asyncRoute(projects.findProject),
  asyncRoute(projects.deleteProject),
);
router.get("/tasks", protect, asyncRoute(tasks.listTasks));
router.post(
  "/workspaces/:workspaceId/tasks",
  protect,
  workspaceAccess,
  adminOnly,
  asyncRoute(tasks.createTask),
);
router.patch(
  "/workspaces/:workspaceId/tasks/:id",
  protect,
  workspaceAccess,
  asyncRoute(tasks.updateTask),
);
router.delete(
  "/workspaces/:workspaceId/tasks/:id",
  protect,
  workspaceAccess,
  asyncRoute(tasks.deleteTask),
);
export default router;
