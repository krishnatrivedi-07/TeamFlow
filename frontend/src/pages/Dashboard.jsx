import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  FolderKanban,
  CheckSquare,
  UsersRound,
  CircleCheck,
  Clock3,
  AlertTriangle,
  Plus,
  CalendarDays,
  Ellipsis,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  Spinner,
  Empty,
  PageHeading,
  Button,
  useToast,
} from "../components/Common";
import { useAuth } from "../context/AuthContext";
import { WorkspaceModal, ProjectModal, TaskModal } from "../components/Forms";
const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "No deadline";
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [modal, setModal] = useState("");
  const [filter, setFilter] = useState("");
  const toast = useToast();
  const { user } = useAuth();
  const load = () =>
    Promise.all([
      api.get("/dashboard"),
      api.get("/workspaces"),
      api.get("/projects"),
    ])
      .then(([d, w, p]) => {
        setData(d.data);
        setWorkspaces(w.data);
        setProjects(p.data);
      })
      .catch((e) =>
        toast(e.response?.data?.message || "Could not load dashboard", "error"),
      );
  useEffect(() => {
    load();
  }, []);
  if (!data) return <Spinner full />;
  const stats = [
    {
      label: "Total projects",
      value: data.metrics.projects,
      icon: FolderKanban,
      color: "violet",
    },
    {
      label: "Total tasks",
      value: data.metrics.tasks,
      icon: CheckSquare,
      color: "blue",
    },
    {
      label: "Completed",
      value: data.metrics.completed,
      icon: CircleCheck,
      color: "green",
    },
    {
      label: "Overdue",
      value: data.metrics.overdue,
      icon: AlertTriangle,
      color: "orange",
    },
  ];
  const adminWorkspaces = workspaces.filter((w) =>
    w.members.some((m) => m.user?._id === user?.id && m.role === "admin"),
  );
  const todayLabel = new Date()
    .toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
  return (
    <>
      <div className="welcome-strip">
        <div>
          <div className="eyebrow">
            {todayLabel} <span className="live-dot" />
          </div>
          <h1>
            Good morning, {user?.name?.split(" ")[0]}{" "}
            <span className="wave">✦</span>
          </h1>
          <p>Here's what's happening across your team today.</p>
        </div>
        <div className="welcome-actions">
          {adminWorkspaces.length > 0 && (
            <>
              <Button variant="secondary" onClick={() => setModal("task")}>
                <Plus size={16} /> Add task
              </Button>
              <Button onClick={() => setModal("project")}>
                <Plus size={16} /> New project
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="dashboard-grid">
        <section className="stats-grid">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-top">
                <div className={`stat-icon ${s.color}`}>
                  <s.icon size={18} />
                </div>
                <button className="stat-menu">
                  <Ellipsis size={18} />
                </button>
              </div>
              <div className="stat-number">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-foot">
                <span className="stat-note">
                  Across {data.metrics.workspaces} workspace
                  {data.metrics.workspaces === 1 ? "" : "s"}
                </span>
                <span className={`stat-indicator ${s.color}`}>
                  <ArrowUpRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </section>
        <section className="panel project-panel">
          <div className="panel-heading">
            <div>
              <h2>Your projects</h2>
              <p>A snapshot of work in motion</p>
            </div>
            <Link className="text-link" to="/projects">
              All projects <ArrowRight size={15} />
            </Link>
          </div>
          {data.projects.length ? (
            <>
              <div className="project-filters">
                <button
                  onClick={() => setFilter("")}
                  className={!filter ? "selected" : ""}
                >
                  All <span>{data.projects.length}</span>
                </button>
                <button
                  onClick={() => setFilter("In Progress")}
                  className={filter === "In Progress" ? "selected" : ""}
                >
                  In progress
                </button>
                <button
                  onClick={() => setFilter("Planning")}
                  className={filter === "Planning" ? "selected" : ""}
                >
                  Planning
                </button>
              </div>
              <div className="project-list">
                {data.projects
                  .filter((p) => !filter || p.status === filter)
                  .slice(0, 4)
                  .map((p, i) => (
                    <Link
                      to={`/projects/${p._id}`}
                      className="project-row"
                      key={p._id}
                    >
                      <div className={`project-symbol symbol-${i % 4}`}>
                        <FolderKanban size={17} />
                      </div>
                      <div className="project-main">
                        <div className="project-title-line">
                          <strong>{p.name}</strong>
                          <span
                            className={`status-dot status-${p.status.toLowerCase().replace(" ", "-")}`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <div className="project-subline">
                          <span>{p.workspace?.name}</span>
                          <span>·</span>
                          <span>{p.taskCount} tasks</span>
                        </div>
                      </div>
                      <div className="project-progress">
                        <div className="progress-line">
                          <i style={{ width: `${p.progress}%` }} />
                        </div>
                        <small>{p.progress}%</small>
                      </div>
                      <div className="project-deadline">
                        <CalendarDays size={14} />
                        {fmt(p.deadline)}
                      </div>
                      <ArrowUpRight className="row-arrow" size={16} />
                    </Link>
                  ))}
              </div>
            </>
          ) : (
            <Empty
              icon={FolderKanban}
              title="Your first project starts here"
              text="Create a project to organize tasks and bring your team together."
              action={
                adminWorkspaces.length > 0 && (
                  <Button onClick={() => setModal("project")}>
                    <Plus size={15} /> Create a project
                  </Button>
                )
              }
            />
          )}
        </section>
        <aside className="right-column">
          <section className="panel deadlines-panel">
            <div className="panel-heading">
              <div>
                <h2>Upcoming deadlines</h2>
                <p>Keep an eye on what's next</p>
              </div>
              <CalendarDays size={17} className="muted-icon" />
            </div>
            {data.upcomingTasks.length ? (
              <div className="deadline-list">
                {data.upcomingTasks.map((task) => (
                  <div className="deadline-row" key={task._id}>
                    <div className="deadline-date">
                      <strong>{new Date(task.dueDate).getDate()}</strong>
                      <small>
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </small>
                    </div>
                    <div className="deadline-info">
                      <strong>{task.title}</strong>
                      <small>
                        {task.project?.name || "Project"} ·{" "}
                        {task.assignee?.name || "Unassigned"}
                      </small>
                    </div>
                    <span
                      className={`priority-dot ${task.priority.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="small-empty">
                <div className="empty-icon">
                  <Clock3 size={19} />
                </div>
                <strong>You're all caught up</strong>
                <span>No upcoming deadlines yet.</span>
              </div>
            )}
            <Link to="/tasks" className="deadline-link">
              View task list <ArrowRight size={14} />
            </Link>
          </section>
          <section className="panel activity-panel">
            <div className="panel-heading">
              <div>
                <h2>Recently updated</h2>
                <p>Projects with recent activity</p>
              </div>
              <Sparkles size={17} className="muted-icon" />
            </div>
            {data.recentProjects.length ? (
              <div className="activity-list">
                {data.recentProjects.slice(0, 4).map((p, i) => (
                  <Link
                    to={`/projects/${p._id}`}
                    className="activity-row"
                    key={p._id}
                  >
                    <span className={`activity-avatar a-${i}`}>
                      {p.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span>
                      <strong>{p.name}</strong>
                      <small>
                        {p.workspace?.name} · {fmt(p.updatedAt)}
                      </small>
                    </span>
                    <ArrowUpRight size={14} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="small-empty">
                <strong>No recent activity</strong>
                <span>Your project updates will appear here.</span>
              </div>
            )}
            <Link to="/projects" className="deadline-link">
              Browse projects <ArrowRight size={14} />
            </Link>
          </section>
        </aside>
      </div>
      {modal === "project" && (
        <ProjectModal
          close={() => setModal("")}
          onSaved={load}
          workspaces={adminWorkspaces}
        />
      )}
      {modal === "task" && (
        <TaskModal
          close={() => setModal("")}
          onSaved={load}
          workspaces={adminWorkspaces}
          projects={projects.filter((p) =>
            adminWorkspaces.some((w) => w._id === p.workspace?._id),
          )}
        />
      )}
    </>
  );
}
