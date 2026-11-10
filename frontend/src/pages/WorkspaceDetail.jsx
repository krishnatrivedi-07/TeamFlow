import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  UsersRound,
  FolderKanban,
  Plus,
  UserPlus,
  Trash2,
  Mail,
  Settings2,
  CalendarDays,
} from "lucide-react";
import api from "../services/api";
import {
  PageHeading,
  Button,
  Spinner,
  Empty,
  useToast,
} from "../components/Common";
import { ProjectModal, WorkspaceModal } from "../components/Forms";
import { Modal } from "../components/Common";
import { useAuth } from "../context/AuthContext";
function MemberModal({ close, onSaved, workspace }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post(`/workspaces/${workspace._id}/members`, { email, role });
      toast("Member added");
      onSaved();
      close();
    } catch (err) {
      toast(err.response?.data?.message || "Could not add member", "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Invite a teammate" onClose={close}>
      <form className="form-stack" onSubmit={submit}>
        <p className="modal-description">
          Add someone who already has a TeamFlow account.
        </p>
        <label>
          Email address
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@email.com"
          />
        </label>
        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={close}>
            Cancel
          </Button>
          <Button disabled={busy}>{busy ? "Adding…" : "Add member"}</Button>
        </div>
      </form>
    </Modal>
  );
}
export default function WorkspaceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [modal, setModal] = useState("");
  const toast = useToast();
  const load = () =>
    Promise.all([
      api.get(`/workspaces/${id}`),
      api.get(`/projects?workspace=${id}`),
    ])
      .then(([w, p]) => {
        setData(w.data);
        setProjects(p.data);
      })
      .catch((e) =>
        toast(e.response?.data?.message || "Could not load workspace", "error"),
      );
  useEffect(() => {
    load();
  }, [id]);
  if (!data) return <Spinner full />;
  const isAdmin = data.members.some(
    (m) => m.user._id === user?.id && m.role === "admin",
  );
  const remove = async (userId) => {
    if (!window.confirm("Remove this member from the workspace?")) return;
    try {
      await api.delete(`/workspaces/${id}/members/${userId}`);
      toast("Member removed");
      load();
    } catch (e) {
      toast(e.response?.data?.message || "Could not remove member", "error");
    }
  };
  return (
    <>
      <Link to="/workspaces" className="back-link">
        <ArrowLeft size={15} /> All workspaces
      </Link>
      <PageHeading
        eyebrow="WORKSPACE"
        title={data.name}
        description={
          data.description || "Manage your team and keep work moving forward."
        }
        action={
          isAdmin && (
            <>
              <Button variant="secondary" onClick={() => setModal("edit")}>
                <Settings2 size={16} /> Edit
              </Button>
              <Button onClick={() => setModal("member")}>
                <UserPlus size={16} /> Invite member
              </Button>
            </>
          )
        }
      />
      <div className="detail-stats">
        <div>
          <FolderKanban size={17} />
          <strong>{projects.length}</strong>
          <span>Projects</span>
        </div>
        <div>
          <UsersRound size={17} />
          <strong>{data.members.length}</strong>
          <span>Members</span>
        </div>
        <div>
          <CalendarDays size={17} />
          <strong>{projects.reduce((s, p) => s + p.taskCount, 0)}</strong>
          <span>Tasks</span>
        </div>
      </div>
      <div className="detail-two-col">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Projects</h2>
              <p>Projects in this workspace</p>
            </div>
            {isAdmin && (
              <Button onClick={() => setModal("project")}>
                <Plus size={15} /> New project
              </Button>
            )}
          </div>
          {projects.length ? (
            <div className="project-list">
              {projects.map((p, i) => (
                <Link
                  to={`/projects/${p._id}`}
                  className="project-row"
                  key={p._id}
                >
                  <div className={`project-symbol symbol-${i % 4}`}>
                    <FolderKanban size={17} />
                  </div>
                  <div className="project-main">
                    <strong>{p.name}</strong>
                    <div className="project-subline">
                      <span>{p.taskCount} tasks</span>
                      <span>·</span>
                      <span>{p.status}</span>
                    </div>
                  </div>
                  <div className="project-progress">
                    <div className="progress-line">
                      <i style={{ width: `${p.progress}%` }} />
                    </div>
                    <small>{p.progress}%</small>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              icon={FolderKanban}
              title="No projects yet"
              text="Add the first project for this workspace."
              action={
                isAdmin && (
                  <Button onClick={() => setModal("project")}>
                    <Plus size={15} /> Create project
                  </Button>
                )
              }
            />
          )}
        </section>
        <section className="panel members-panel">
          <div className="panel-heading">
            <div>
              <h2>People</h2>
              <p>{data.members.length} team members</p>
            </div>
            {isAdmin && (
              <button
                className="icon-btn soft"
                onClick={() => setModal("member")}
                title="Add member"
              >
                <UserPlus size={17} />
              </button>
            )}
          </div>
          <div className="member-list">
            {data.members.map((m, i) => (
              <div className="member-row" key={m.user._id}>
                <div className={`avatar member-avatar tone-${i % 5}`}>
                  {m.user.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="member-copy">
                  <strong>{m.user.name}</strong>
                  <small>
                    <Mail size={12} />
                    {m.user.email}
                  </small>
                </div>
                <span className={`role-pill ${m.role}`}>{m.role}</span>
                {isAdmin && m.role === "member" && (
                  <button
                    className="icon-btn remove-member"
                    title="Remove member"
                    onClick={() => remove(m.user._id)}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
      {isAdmin && modal === "member" && (
        <MemberModal
          close={() => setModal("")}
          workspace={data}
          onSaved={load}
        />
      )}
      {isAdmin && modal === "project" && (
        <ProjectModal
          close={() => setModal("")}
          onSaved={load}
          workspaces={[data]}
        />
      )}
      {isAdmin && modal === "edit" && (
        <WorkspaceModal
          close={() => setModal("")}
          onSaved={load}
          workspace={data}
        />
      )}
    </>
  );
}
