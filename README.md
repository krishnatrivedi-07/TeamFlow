# TeamFlow

TeamFlow is a full-stack project and task management app for college groups and small teams. It brings workspaces, projects, tasks, deadlines, and team membership into one place, so teams can see who is doing what and keep shared work moving.

## Why TeamFlow

College projects and small-team work often spread across chats, documents, and personal to-do lists. That makes ownership, deadlines, and progress hard to track. TeamFlow gives a team a shared workspace for organizing projects and tasks, assigning work, and checking progress without needing a large or complex project management system.

## Features

- Register and sign in with email and password. Passwords are hashed with bcrypt, and sessions use seven-day JWTs.
- Each new account receives a starter workspace.
- Workspace admins can create and edit workspaces, add registered users by email, assign workspace roles, and remove members.
- Projects belong to a workspace and include a description, start date, deadline, status, members, and progress calculated from their tasks.
- Tasks include a title, description, status, priority, due date, project, and optional workspace-member assignee. Admins can manage task details; members can change the status of tasks assigned to them.
- The dashboard shows workspace, project, and task counts, project progress, recent projects, upcoming tasks, and overdue counts using MongoDB data.
- Search and filter projects and tasks by their available fields.
- The responsive React interface includes loading and empty states, inline notifications, and form validation.
- The API checks workspace membership on workspace-specific endpoints and limits each user's workspace data accordingly.

## Screenshots

Screenshots have not been added yet. Use the placeholders below when captures are available.

| Page | Screenshot |
| --- | --- |
| Dashboard | Screenshot placeholder: add dashboard capture |
| Workspaces | Screenshot placeholder: add workspaces capture |
| Projects | Screenshot placeholder: add projects capture |
| Tasks | Screenshot placeholder: add tasks capture |
| Profile / Settings | Screenshot placeholder: add profile/settings capture |

## Technology stack

- **Frontend:** React 18, Vite, React Router, Axios, Tailwind CSS, and Lucide icons.
- **Backend:** Node.js, Express, Mongoose, MongoDB, JWT, bcryptjs, Helmet, CORS, and express-rate-limit.
- **Language:** JavaScript with ES modules.

## Project structure

```text
TeamFlow/
  backend/
    config/          MongoDB connection
    controllers/     Auth, workspace, project, and task logic
    middleware/      Authentication, authorization, and errors
    models/          User, Workspace, Project, and Task
    routes/          REST API routes
    utils/           Validation and async route helper
    server.js
    .env.example
  frontend/
    src/
      components/    Layout, forms, and shared UI
      context/       Authentication state
      pages/         Dashboard, auth, workspaces, projects, tasks, settings
      services/      Axios API client
    index.html
    vite.config.js
    tailwind.config.js
  package.json       Root development and build scripts
```

## Requirements

- Node.js 20.19+ or 22.12+ (Node 24 is also supported) and npm.
- A MongoDB Atlas cluster or a local MongoDB server.

## Set up MongoDB Atlas

1. Create a cluster in [MongoDB Atlas](https://www.mongodb.com/atlas).
2. In **Database Access**, create a database user.
3. In **Network Access**, allow your development IP address. Avoid allowing all IPs in production.
4. In Atlas, select **Connect > Drivers** and copy the connection details. Configure them in your local environment file; URL-encode special characters in the database user's password.
5. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` to your private MongoDB connection string.
6. Replace `JWT_SECRET` with a private random value of at least 32 characters. Keep `.env` private; environment files are ignored by Git.

This repository does not include database credentials or a configured connection string. The API exits with a clear message if `MONGODB_URI` is missing.

## Install and run on Windows

From the TeamFlow root directory, run these commands in PowerShell:

```powershell
npm.cmd install
npm.cmd install --prefix backend
npm.cmd install --prefix frontend
Copy-Item backend/.env.example backend/.env
# Edit backend/.env and set MONGODB_URI and a private JWT_SECRET
npm.cmd run dev
```

The root `dev` script starts the API and frontend together. The frontend is available at <http://localhost:5173> and the API at <http://localhost:5000>. In PowerShell, use `npm.cmd` if the execution policy blocks `npm.ps1`.

To run each process in a separate terminal:

```powershell
npm.cmd run dev --prefix backend
npm.cmd run dev --prefix frontend
```

To build the frontend and start the API:

```powershell
npm.cmd run build --prefix frontend
npm.cmd start --prefix backend
```

## Environment variables

| Variable | Purpose | Default / requirement |
| --- | --- | --- |
| `PORT` | Express server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | Secret used to sign and verify access tokens | Required; at least 32 characters |
| `CLIENT_URL` | Present in `backend/.env.example` for the frontend origin | Currently unused; CORS allows `http://localhost:5173` and `http://127.0.0.1:5173` in `backend/server.js` |
| `VITE_API_URL` | Frontend API base URL | `http://localhost:5000/api` |

## API overview

All API routes are prefixed with `/api`. Private routes require `Authorization: Bearer <token>`.

| Area | Routes |
| --- | --- |
| Authentication | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PATCH /auth/profile` |
| Dashboard | `GET /dashboard` |
| Workspaces | `GET/POST /workspaces`, `GET/PATCH /workspaces/:workspaceId`, `POST /workspaces/:workspaceId/members`, `DELETE /workspaces/:workspaceId/members/:userId` |
| Projects | `GET /projects`, `POST /workspaces/:workspaceId/projects`, `GET/PATCH/DELETE /workspaces/:workspaceId/projects/:id` |
| Tasks | `GET /tasks`, `POST /workspaces/:workspaceId/tasks`, `PATCH/DELETE /workspaces/:workspaceId/tasks/:id` |
| Health | `GET /health` |

The task list supports status, priority, assignee, project, workspace, and title-search query parameters. The project list can be filtered by workspace. Successful responses are JSON; errors return a JSON `message` and an appropriate HTTP status. The health endpoint is available after the API connects to the database.

## Known MVP limits

- Workspace invitations add a user immediately by email and require that the person already has a TeamFlow account; no invitation email is sent.
- JWTs are stored in browser local storage for this learning MVP. Production deployment should use a reviewed cookie/session strategy, HTTPS, and secret rotation.
- Password reset and password change flows are not implemented.
- **Account security** in Settings is informational. Members cannot edit task fields or delete tasks; workspace admins manage task details.
- There is no automated test suite. MongoDB-backed verification requires a configured database.
- Charts and analytics, notifications, and external integrations are outside this MVP.

## Future enhancements

Potential next steps include password reset and invitation emails, audit history, richer team roles, automated API and UI tests, deployment configuration, and optional integrations, while keeping the core workspace/project/task model.
