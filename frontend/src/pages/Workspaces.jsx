import { useEffect, useState } from "react";
import { ArrowUpRight, UsersRound, FolderKanban, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  PageHeading,
  Button,
  Spinner,
  Empty,
  useToast,
} from "../components/Common";
import { WorkspaceModal } from "../components/Forms";
import { useAuth } from "../context/AuthContext";
export default function Workspaces() {
  const [items, setItems] = useState(null);
  const [modal, setModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const toast = useToast();
  const { user } = useAuth();
  const load = () =>
    Promise.all([api.get("/workspaces"), api.get("/projects")])
      .then(([w, p]) => {
        setItems(w.data);
        setProjects(p.data);
      })
      .catch((e) =>
        toast(
          e.response?.data?.message || "Could not load workspaces",
          "error",
        ),
      );
  useEffect(() => {
    load();
  }, []);
  if (!items) return <Spinner full />;
  return (
    <>
      <PageHeading
        eyebrow="YOUR TEAM HUB"
        title="Workspaces"
        description="The people and projects you work with, all in one place."
        action={
          <Button onClick={() => setModal(true)}>
            <Plus size={16} /> New workspace
          </Button>
        }
      />
      {items.length ? (
        <div className="workspace-grid">
          {items.map((w, i) => {
            const ps = projects.filter((p) => p.workspace?._id === w._id);
            const count = ps.reduce((sum, p) => sum + (p.taskCount || 0), 0);
            const role =
              w.members.find((m) => m.user?._id === user?.id)?.role || "member";
            return (
              <Link
                className="workspace-card"
                to={`/workspaces/${w._id}`}
                key={w._id}
              >
                <div className="workspace-card-top">
                  <div className={`workspace-art art-${i % 4}`}>
                    {w.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="workspace-role">{role}</span>
                  <ArrowUpRight size={16} />
                </div>
                <h2>{w.name}</h2>
                <p>
                  {w.description ||
                    "A space for your team to plan and make progress."}
                </p>
                <div className="workspace-meta">
                  <span>
                    <UsersRound size={15} />
                    {w.members.length} members
                  </span>
                  <span>
                    <FolderKanban size={15} />
                    {ps.length} projects
                  </span>
                </div>
                <div className="workspace-card-foot">
                  <div className="avatar-stack">
                    {w.members.slice(0, 4).map((m) => (
                      <i key={m.user?._id}>
                        {m.user?.name?.slice(0, 1).toUpperCase() || "?"}
                      </i>
                    ))}
                    {w.members.length > 4 && <i>+{w.members.length - 4}</i>}
                  </div>
                  <span>{count} tasks</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <Empty
          icon={UsersRound}
          title="Create a space for your team"
          text="Workspaces keep your projects, members, and tasks organized."
          action={
            <Button onClick={() => setModal(true)}>
              <Plus size={15} /> Create workspace
            </Button>
          }
        />
      )}{" "}
      {modal && <WorkspaceModal close={() => setModal(false)} onSaved={load} />}
    </>
  );
}
