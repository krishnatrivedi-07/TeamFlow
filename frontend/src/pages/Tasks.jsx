import { useEffect, useState } from "react";
import {
  Check,
  Search,
  SlidersHorizontal,
  Plus,
  CalendarDays,
  ArrowUpRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  Button,
  Empty,
  PageHeading,
  Spinner,
  useToast,
} from "../components/Common";
import { TaskModal } from "../components/Forms";
import { useAuth } from "../context/AuthContext";
export default function Tasks() {
  const [tasks, setTasks] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [assignee, setAssignee] = useState("All");
  const toast = useToast();
  const { user } = useAuth();
  const load = () =>
    Promise.all([
      api.get("/tasks"),
      api.get("/workspaces"),
      api.get("/projects"),
    ])
      .then(([t, w, p]) => {
        setTasks(t.data);
        setWorkspaces(w.data);
        setProjects(p.data);
      })
      .catch((e) =>
        toast(e.response?.data?.message || "Could not load tasks", "error"),
      );
  useEffect(() => {
    load();
  }, []);
  if (!tasks) return <Spinner full />;
  const adminWorkspaces = workspaces.filter((w) =>
    w.members.some((m) => m.user?._id === user?.id && m.role === "admin"),
  );
  let visible = tasks.filter(
    (t) =>
      (status === "All" || t.status === status) &&
      (priority === "All" || t.priority === priority) &&
      (assignee === "All" || t.assignee?._id === assignee) &&
      t.title.toLowerCase().includes(search.toLowerCase()),
  );
  const isAdminTask = (t) => adminWorkspaces.some((w) => w._id === t.workspace);
  const canUpdate = (t) => isAdminTask(t) || t.assignee?._id === user?.id;
  const cycle = async (t) => {
    const next =
      t.status === "To Do"
        ? "In Progress"
        : t.status === "In Progress"
          ? "Completed"
          : "To Do";
    try {
      await api.patch(`/workspaces/${t.workspace}/tasks/${t._id}`, {
        status: next,
      });
      load();
    } catch (e) {
      toast(e.response?.data?.message || "Could not update task", "error");
    }
  };
  const remove = async (t) => {
    if (!window.confirm(`Delete “${t.title}”?`)) return;
    try {
      await api.delete(`/workspaces/${t.workspace}/tasks/${t._id}`);
      toast("Task deleted");
      load();
    } catch (e) {
      toast(e.response?.data?.message || "Could not delete task", "error");
    }
  };
  const members = [
    ...new Map(
      tasks.filter((t) => t.assignee).map((t) => [t.assignee._id, t.assignee]),
    ).values(),
  ];
  return (
    <>
      <PageHeading
        eyebrow="TEAM WORK"
        title="Tasks"
        description="A clear view of what needs doing and who's on it."
        action={
          adminWorkspaces.length > 0 && (
            <Button onClick={() => setModal(true)}>
              <Plus size={16} /> New task
            </Button>
          )
        }
      />
      <div className="task-toolbar">
        <div className="search-field">
          <Search size={16} />
          <input
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="select-filters">
          <label>
            <SlidersHorizontal size={15} />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All</option>
              {["To Do", "In Progress", "Completed"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option>All</option>
              {["Low", "Medium", "High"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            >
              <option value="All">All people</option>
              {members.map((m) => (
                <option value={m._id} key={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {visible.length ? (
        <div className="panel task-list-panel">
          <div className="task-list-head">
            <span>
              {visible.length} task{visible.length === 1 ? "" : "s"}
            </span>
            <span>Click the circle to move a task forward</span>
          </div>
          {visible.map((t) => (
            <div className="task-list-row" key={t._id}>
              <button
                disabled={!canUpdate(t)}
                className={`task-check ${t.status === "Completed" ? "checked" : ""}`}
                onClick={() => cycle(t)}
                title={
                  canUpdate(t)
                    ? "Cycle task status"
                    : "Only the assignee can update this task"
                }
              >
                {t.status === "Completed" ? (
                  <Check size={13} />
                ) : t.status === "In Progress" ? (
                  <span />
                ) : null}
              </button>
              <div className="task-list-main">
                <strong className={t.status === "Completed" ? "struck" : ""}>
                  {t.title}
                </strong>
                <div className="task-list-meta">
                  <Link to={`/projects/${t.project?._id}`}>
                    {t.project?.name || "Project"}
                  </Link>
                  <span>·</span>
                  <span
                    className={`priority-label ${t.priority.toLowerCase()}`}
                  >
                    <i />
                    {t.priority}
                  </span>
                  {t.dueDate && (
                    <>
                      <span>·</span>
                      <span
                        className={
                          new Date(t.dueDate) < new Date() &&
                          t.status !== "Completed"
                            ? "overdue-text"
                            : ""
                        }
                      >
                        <CalendarDays size={13} />
                        {new Date(t.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="task-list-person">
                <i>{t.assignee?.name?.slice(0, 1) || "?"}</i>
                <span>{t.assignee?.name || "Unassigned"}</span>
              </div>
              <span
                className={`status-pill ${t.status.toLowerCase().replace(" ", "-")}`}
              >
                {t.status}
              </span>
              {isAdminTask(t) && (
                <>
                  <button
                    className="icon-btn"
                    onClick={() => setModal(t)}
                    title="Edit task"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="icon-btn danger"
                    onClick={() => remove(t)}
                    title="Delete task"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
              <Link to={`/projects/${t.project?._id}`} className="icon-btn">
                <ArrowUpRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          icon={Search}
          title={
            search || status !== "All" || priority !== "All"
              ? "No matching tasks"
              : "Your task list is clear"
          }
          text={
            search || status !== "All" || priority !== "All"
              ? "Adjust a filter to see more tasks."
              : "Create your first task and turn plans into progress."
          }
          action={
            tasks.length === 0 &&
            adminWorkspaces.length > 0 && (
              <Button onClick={() => setModal(true)}>
                <Plus size={15} /> Create a task
              </Button>
            )
          }
        />
      )}
      {modal && (
        <TaskModal
          task={typeof modal === "object" ? modal : undefined}
          close={() => setModal(false)}
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
