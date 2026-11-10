import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Circle,
  Clock3,
  Ellipsis,
  Plus,
  Trash2,
  Pencil,
  UserRound,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import {
  Button,
  Empty,
  PageHeading,
  Spinner,
  useToast,
} from "../components/Common";
import { ProjectModal, TaskModal } from "../components/Forms";
import { useAuth } from "../context/AuthContext";
export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modal, setModal] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const load = () =>
    Promise.all([api.get("/projects"), api.get("/workspaces")])
      .then(async ([p, w]) => {
        const found = p.data.find((x) => x._id === id);
        if (!found) throw new Error("Project not found");
        const [detail, workspace] = await Promise.all([
          api.get(`/workspaces/${found.workspace._id}/projects/${id}`),
          api.get(`/workspaces/${found.workspace._id}`),
        ]);
        setData(detail.data);
        setWorkspaces(w.data);
        setIsAdmin(
          workspace.data.members.some(
            (m) => m.user._id === user?.id && m.role === "admin",
          ),
        );
      })
      .catch((e) =>
        toast(
          e.response?.data?.message || e.message || "Could not load project",
          "error",
        ),
      );
  useEffect(() => {
    load();
  }, [id]);
  if (!data) return <Spinner full />;
  const done = data.tasks.filter((t) => t.status === "Completed").length;
  const remove = async () => {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    try {
      await api.delete(`/workspaces/${data.workspace}/projects/${id}`);
      toast("Project deleted");
      navigate("/projects");
    } catch (e) {
      toast(e.response?.data?.message || "Could not delete project", "error");
    }
  };
  const canUpdate = (t) => isAdmin || t.assignee?._id === user?.id;
  const updateStatus = async (task) => {
    const status =
      task.status === "To Do"
        ? "In Progress"
        : task.status === "In Progress"
          ? "Completed"
          : "To Do";
    try {
      await api.patch(`/workspaces/${data.workspace}/tasks/${task._id}`, {
        status,
      });
      load();
    } catch (e) {
      toast(e.response?.data?.message || "Could not update task", "error");
    }
  };
  return (
    <>
      <Link to="/projects" className="back-link">
        <ArrowLeft size={15} /> All projects
      </Link>
      <PageHeading
        eyebrow={data.workspace?.name || "PROJECT"}
        title={data.name}
        description={
          data.description || "Keep your team moving in the same direction."
        }
        action={
          isAdmin && (
            <>
              <Button variant="secondary" onClick={() => setModal("edit")}>
                <Pencil size={15} /> Edit project
              </Button>
              <button
                className="icon-btn danger"
                onClick={remove}
                title="Delete project"
              >
                <Trash2 size={17} />
              </button>
            </>
          )
        }
      />
      <div className="project-summary panel">
        <div className="summary-progress">
          <div className="ring" style={{ "--progress": `${data.progress}%` }}>
            <span>{data.progress}%</span>
          </div>
          <div>
            <strong>Project progress</strong>
            <p>
              {done} of {data.tasks.length} tasks completed
            </p>
          </div>
        </div>
        <div className="summary-fact">
          <CalendarDays size={17} />
          <span>Deadline</span>
          <strong>
            {data.deadline
              ? new Date(data.deadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Not set"}
          </strong>
        </div>
        <div className="summary-fact">
          <Clock3 size={17} />
          <span>Status</span>
          <strong>{data.status}</strong>
        </div>
        <div className="summary-fact">
          <UserRound size={17} />
          <span>Project members</span>
          <strong>{data.members?.length || 0} people</strong>
        </div>
      </div>
      <section className="panel project-task-panel">
        <div className="panel-heading">
          <div>
            <h2>
              Tasks <span className="count-badge">{data.tasks.length}</span>
            </h2>
            <p>Everything that moves this project forward.</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setModal("task")}>
              <Plus size={15} /> Add task
            </Button>
          )}
        </div>
        {data.tasks.length ? (
          <div className="task-table-wrap">
            <table className="task-table">
              <thead>
                <tr>
                  <th>TASK</th>
                  <th>ASSIGNEE</th>
                  <th>PRIORITY</th>
                  <th>DUE DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {data.tasks.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div className="task-name-cell">
                        <button
                          disabled={!canUpdate(t)}
                          className={`task-check ${t.status === "Completed" ? "checked" : ""}`}
                          onClick={() => updateStatus(t)}
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
                        <div>
                          <strong
                            className={t.status === "Completed" ? "struck" : ""}
                          >
                            {t.title}
                          </strong>
                          {t.description && <small>{t.description}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="assignee-cell">
                        <i>{t.assignee?.name?.slice(0, 1) || "?"}</i>
                        {t.assignee?.name || "Unassigned"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`priority-label ${t.priority.toLowerCase()}`}
                      >
                        <i />
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      {t.dueDate
                        ? new Date(t.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                    <td>
                      <button
                        disabled={!canUpdate(t)}
                        className={`status-pill ${t.status.toLowerCase().replace(" ", "-")}`}
                        onClick={() => updateStatus(t)}
                      >
                        {t.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            icon={Circle}
            title="No tasks yet"
            text={
              isAdmin
                ? "Break your project into small, actionable tasks."
                : "Your team has not added tasks yet."
            }
            action={
              isAdmin && (
                <Button onClick={() => setModal("task")}>
                  <Plus size={15} /> Create task
                </Button>
              )
            }
          />
        )}
      </section>
      {isAdmin && modal === "edit" && (
        <ProjectModal
          project={{ ...data, workspace: { _id: data.workspace } }}
          close={() => setModal("")}
          onSaved={load}
          workspaces={workspaces}
        />
      )}
      {isAdmin && modal === "task" && (
        <TaskModal
          close={() => setModal("")}
          onSaved={load}
          workspaces={workspaces}
          projects={[{ ...data, workspace: { _id: data.workspace } }]}
        />
      )}
    </>
  );
}
