# TeamFlow

TeamFlow is a full-stack project and task management app for college groups and small teams. It brings workspaces, projects, tasks, deadlines, and team membership together in one place.

## Features

- Email registration and sign in with bcrypt password hashing and seven-day JWT sessions.
- A starter workspace is created for each new account.
- Workspace admins can create and edit workspaces, invite registered users by email, and remove members.
- Projects belong to one workspace and include a description, dates, status, team, and task-derived progress.
- Tasks include status, priority, due date, project, and optional workspace-member assignee. Admins manage tasks; members can update the status of tasks assigned to them.
- Dashboard counts, project progress, recent projects, upcoming deadlines, search, and task filters come from MongoDB data.
- Responsive React interface, loading/empty states, inline notifications, and form validation.
- Workspace membership is checked by the API on workspace-specific endpoints. A user's API data is limited to their workspaces.

## Stack

- Frontend: React 18, Vite, React Router, Axios, Tailwind CSS, Lucide icons.
- Backend: Node.js, Express, Mongoose, MongoDB, JWT, bcryptjs, Helmet, CORS, rate limiting.
- JavaScript (ES modules) throughout.

## Folder structure

```text
TeamFlow/
  backend/
    config/       MongoDB connection
    controllers/  Auth, workspace, project, task logic
    middleware/   Authentication, authorization, errors
    models/       User, Workspace, Project, Task
    routes/       REST API routes
    utils/        Validation and async route helper
    server.js
    .env.example
  frontend/
    src/
      components/ Reusable layout, forms, and shared UI
      context/    Authentication state
      pages/      Dashboard, auth, workspaces, projects, tasks, settings
      services/   Axios API client
  package.json
```

## Requirements

- Node.js 20.19+ or 22.12+ (Node 24 is also supported) and npm.
- A MongoDB Atlas cluster or local MongoDB server.

## MongoDB Atlas setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. In **Database Access**, create a database user and save its password.
3. In **Network Access**, allow your development IP address. Avoid allowing all IPs for production.
4. Select **Connect → Drivers**, copy the connection string, and replace the username/password placeholders. URL-encode special characters in the password.
5. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`.
6. Replace `JWT_SECRET` with a long random secret. Keep `.env` private; it is ignored by Git.

No database credentials are included in this repository. The API intentionally exits with a clear message when `MONGODB_URI` is missing.

## Install and run on Windows

From the TeamFlow folder, in PowerShell:

```powershell
npm.cmd install
npm.cmd install --prefix backend
npm.cmd install --prefix frontend
Copy-Item backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and a private JWT_SECRET
npm.cmd run dev
```

The frontend runs at <http://localhost:5173> and the API at <http://localhost:5000>. In PowerShell, use `npm.cmd` if the execution policy blocks `npm.ps1`.

For separate terminals:

```powershell
npm.cmd run dev --prefix backend
npm.cmd run dev --prefix frontend
```

For a production frontend build and API process:

```powershell
npm.cmd run build --prefix frontend
npm.cmd start --prefix backend
```

## Environment variables

| Variable       | Purpose                           | Default                                     |
| -------------- | --------------------------------- | ------------------------------------------- |
| `PORT`         | Express port                      | `5000`                                      |
| `MONGODB_URI`  | MongoDB connection string         | Required                                    |
| `JWT_SECRET`   | Secret used to sign access tokens | Required; use at least 32 random characters |
| `CLIENT_URL`   | Allowed frontend origin for CORS  | `http://localhost:5173`                     |
| `VITE_API_URL` | Frontend API base URL             | `http://localhost:5000/api`                 |

## API overview

All routes are prefixed with `/api`; private routes require `Authorization: Bearer <token>`.

| Area       | Routes                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| Auth       | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PATCH /auth/profile`                                           |
| Dashboard  | `GET /dashboard`                                                                                                           |
| Workspaces | `GET/POST /workspaces`, `GET/PATCH /workspaces/:workspaceId`, member `POST/DELETE` routes                                  |
| Projects   | `GET /projects`, workspace-scoped `POST/GET/PATCH/DELETE /workspaces/:workspaceId/projects/:id`                            |
| Tasks      | `GET /tasks` (status, priority, assignee, project, workspace, search filters); workspace-scoped `POST/PATCH/DELETE` routes |
| Health     | `GET /health` (under `/api`)                                                                                               |

Successful API responses are JSON. Errors return a JSON `message` and an appropriate HTTP status. Health responds after database connection.

## Known MVP limits

- Workspace invitations are immediate additions by email and require the person to have registered first; there is no email delivery.
- JWTs are stored in browser local storage for this learning MVP. Production deployment should use a reviewed cookie/session strategy, HTTPS, and secret rotation.
- There is no password reset or password change flow yet.
- “Account security” in Settings is informational. Members cannot self-edit task fields or delete tasks; workspace admins manage task details.
- No automated test suite is included. MongoDB-backed verification requires your configured database.
- Charts/analytics, notifications, and external integrations are outside this MVP.

## Future enhancements

Add password reset and invitation emails, audit history, richer team roles, automated API/UI tests, deployment configuration, and optional integrations without changing the core workspace/project/task model.
