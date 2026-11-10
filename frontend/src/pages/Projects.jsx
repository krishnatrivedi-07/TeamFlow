import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  FolderKanban,
  Plus,
  Search,
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
import { ProjectModal } from "../components/Forms";
import { useAuth } from "../context/AuthContext";
export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [modal, setModal] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const toast = useToast();
  const { user } = useAuth();
  const load = () =>
    Promise.all([api.get("/projects"), api.get("/workspaces")])
      .then(([p, w]) => {
        setProjects(p.data);
        setWorkspaces(w.data);
      })
      .catch((e) =>
        toast(e.response?.data?.message || "Could not load projects", "error"),
      );
  useEffect(() => {
    load();
  }, []);
  if (!projects) return <Spinner full />;
  const adminWorkspaces = workspaces.filter((w) =>
    w.members.some((m) => m.user?._id === user?.id && m.role === "admin"),
  );
  const visible = projects.filter(
    (p) =>
      (status === "All" || p.status === status) &&
      p.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="PROJECT PORTFOLIO"
        title="Projects"
        description="Plan, track, and deliver meaningful work together."
        action={
          adminWorkspaces.length > 0 && (
            <Button onClick={() => setModal(true)}>
              <Plus size={16} /> New project
            </Button>
          )
        }
      />
      <div className="toolbar">
        <div className="filter-tabs">
          {["All", "Planning", "In Progress", "On Hold", "Completed"].map(
            (x) => (
              <button
                key={x}
                className={status === x ? "selected" : ""}
                onClick={() => setStatus(x)}
              >
                {x}
                {x === "All" && <span>{projects.length}</span>}
              </button>
            ),
          )}
        </div>
        <div className="search-field">
          <Search size={16} />
          <input
            placeholder="Search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      {visible.length ? (
        <div className="project-card-grid">
          {visible.map((p, i) => (
            <Link
              className="project-card"
              key={p._id}
              to={`/projects/${p._id}`}
            >
              <div className="project-card-top">
                <div className={`project-symbol large symbol-${i % 4}`}>
                  <FolderKanban size={19} />
                </div>
                <ArrowUpRight size={17} />
              </div>
              <div className="project-card-meta">
                <span
                  className={`status-dot status-${p.status.toLowerCase().replace(" ", "-")}`}
                >
                  {p.status}
                </span>
                <span>{p.workspace?.name}</span>
              </div>
              <h2>{p.name}</h2>
              <p>{p.description || "No project description yet."}</p>
              <div className="project-card-progress">
                <div className="progress-caption">
                  <span>Progress</span>
                  <strong>{p.progress}%</strong>
                </div>
                <div className="progress-line">
                  <i style={{ width: `${p.progress}%` }} />
                </div>
              </div>
              <div className="project-card-foot">
                <span>
                  <FolderKanban size={14} />
                  {p.taskCount} tasks
                </span>
                <span>
                  <CalendarDays size={14} />
                  {p.deadline
                    ? new Date(p.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No deadline"}
                </span>
                <div className="avatar-stack">
                  {(p.members || []).slice(0, 3).map((m) => (
                    <i key={m._id}>{m.name?.slice(0, 1)}</i>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty
          icon={FolderKanban}
          title={
            query || status !== "All"
              ? "No matching projects"
              : "Your project space is ready"
          }
          text={
            query || status !== "All"
              ? "Try another search or filter."
              : "Create a project to give your team a shared goal."
          }
          action={
            !query &&
            status === "All" &&
            adminWorkspaces.length > 0 && (
              <Button onClick={() => setModal(true)}>
                <Plus size={15} /> Create a project
              </Button>
            )
          }
        />
      )}
      {modal && (
        <ProjectModal
          close={() => setModal(false)}
          onSaved={load}
          workspaces={adminWorkspaces}
        />
      )}
    </>
  );
}
