import { useEffect, useState } from "react";
import { Modal, Button } from "./Common";
import api from "../services/api";
import { useToast } from "./Common";

export function WorkspaceModal({ close, onSaved, workspace }) {
  const [form, setForm] = useState({
    name: workspace?.name || "",
    description: workspace?.description || "",
  });
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (workspace) await api.patch(`/workspaces/${workspace._id}`, form);
      else await api.post("/workspaces", form);
      toast(workspace ? "Workspace updated" : "Workspace created");
      onSaved();
      close();
    } catch (err) {
      toast(err.response?.data?.message || "Could not save workspace", "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title={workspace ? "Edit workspace" : "Create workspace"}
      onClose={close}
    >
      <form className="form-stack" onSubmit={submit}>
        <label>
          Workspace name
          <input
            required
            maxLength="100"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Design team"
          />
        </label>
        <label>
          Description <span className="optional">Optional</span>
          <textarea
            rows="3"
            maxLength="500"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What is this workspace for?"
          />
        </label>
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button disabled={busy}>
            {busy ? "Saving…" : workspace ? "Save changes" : "Create workspace"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function ProjectModal({ close, onSaved, workspaces, project }) {
  const [form, setForm] = useState({
    name: project?.name || "",
    description: project?.description || "",
    workspace: project?.workspace?._id || workspaces[0]?._id || "",
    status: project?.status || "Planning",
    startDate: project?.startDate?.slice(0, 10) || "",
    deadline: project?.deadline?.slice(0, 10) || "",
    members: project?.members?.map((m) => m._id) || [],
  });
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const [members, setMembers] = useState([]);
  useEffect(() => {
    if (form.workspace)
      api
        .get(`/workspaces/${form.workspace}`)
        .then((r) => setMembers(r.data.members || []))
        .catch(() => setMembers([]));
  }, [form.workspace]);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form };
      if (project)
        await api.patch(
          `/workspaces/${project.workspace._id}/projects/${project._id}`,
          payload,
        );
      else await api.post(`/workspaces/${form.workspace}/projects`, payload);
      toast(project ? "Project updated" : "Project created");
      onSaved();
      close();
    } catch (err) {
      toast(err.response?.data?.message || "Could not save project", "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title={project ? "Edit project" : "New project"} onClose={close}>
      <form className="form-stack" onSubmit={submit}>
        <label>
          Project name
          <input
            required
            maxLength="120"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Campus mobile app"
          />
        </label>
        <label>
          Description
          <textarea
            rows="3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="A little context for your team"
          />
        </label>
        {!project && (
          <label>
            Workspace
            <select
              value={form.workspace}
              required
              onChange={(e) =>
                setForm({ ...form, workspace: e.target.value, members: [] })
              }
            >
              {workspaces.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <fieldset className="member-picker">
          <legend>
            Project members <span className="optional">Optional</span>
          </legend>
          {members.length ? (
            members.map((m) => (
              <label key={m.user._id}>
                <input
                  type="checkbox"
                  checked={form.members.includes(m.user._id)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      members: e.target.checked
                        ? [...form.members, m.user._id]
                        : form.members.filter((id) => id !== m.user._id),
                    })
                  }
                />
                <span>{m.user.name}</span>
                <small>{m.role}</small>
              </label>
            ))
          ) : (
            <p>Add people to the workspace to select project members.</p>
          )}
        </fieldset>
        <div className="form-row">
          <label>
            Start date
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </label>
          <label>
            Deadline
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </label>
        </div>
        <label>
          Status
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {["Planning", "In Progress", "On Hold", "Completed"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button disabled={busy || !workspaces.length}>
            {busy ? "Saving…" : project ? "Save changes" : "Create project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function TaskModal({ close, onSaved, workspaces, projects, task }) {
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    workspace:
      task?.workspace?._id ||
      task?.workspace ||
      task?.project?.workspace?._id ||
      projects[0]?.workspace?._id ||
      workspaces[0]?._id ||
      "",
    project: task?.project?._id || projects[0]?._id || "",
    assignee: task?.assignee?._id || "",
    priority: task?.priority || "Medium",
    status: task?.status || "To Do",
    dueDate: task?.dueDate?.slice(0, 10) || "",
  });
  const [members, setMembers] = useState([]);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const availableProjects = projects.filter(
    (p) =>
      p.workspace?._id === form.workspace || p.workspace === form.workspace,
  );
  useEffect(() => {
    if (form.workspace)
      api
        .get(`/workspaces/${form.workspace}`)
        .then((r) => setMembers(r.data.members || []))
        .catch(() => setMembers([]));
  }, [form.workspace]);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (task)
        await api.patch(
          `/workspaces/${form.workspace}/tasks/${task._id}`,
          form,
        );
      else await api.post(`/workspaces/${form.workspace}/tasks`, form);
      toast(task ? "Task updated" : "Task created");
      onSaved();
      close();
    } catch (err) {
      toast(err.response?.data?.message || "Could not save task", "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title={task ? "Edit task" : "Create a task"} onClose={close}>
      <form className="form-stack" onSubmit={submit}>
        <label>
          Task title
          <input
            required
            maxLength="160"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="What needs to get done?"
          />
        </label>
        <label>
          Description <span className="optional">Optional</span>
          <textarea
            rows="3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Add helpful context…"
          />
        </label>
        <label>
          Workspace
          <select
            value={form.workspace}
            onChange={(e) =>
              setForm({ ...form, workspace: e.target.value, project: "" })
            }
          >
            {workspaces.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Project
          <select
            required
            value={form.project}
            onChange={(e) => setForm({ ...form, project: e.target.value })}
          >
            <option value="">Choose a project</option>
            {availableProjects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Assignee
          <select
            value={form.assignee}
            onChange={(e) => setForm({ ...form, assignee: e.target.value })}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.user._id} value={m.user._id}>
                {m.user.name}
              </option>
            ))}
          </select>
        </label>
        <div className="form-row">
          <label>
            Priority
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {["Low", "Medium", "High"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {["To Do", "In Progress", "Completed"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Due date
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </label>
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button disabled={busy || !availableProjects.length}>
            {busy ? "Saving…" : task ? "Save changes" : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
