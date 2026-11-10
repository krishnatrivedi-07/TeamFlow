import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Layers3, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Common";
function AuthShell({ children, title, subtitle, footer, busy, onSubmit }) {
  return (
    <main className="auth-page">
      <div className="auth-brand">
        <div className="brand-mark">
          <Layers3 size={20} />
        </div>
        <span>teamflow</span>
        <i>.</i>
      </div>
      <div className="auth-layout">
        <div className="auth-art">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-copy">
            <div className="art-badge">
              <Sparkles size={14} /> MADE FOR MOMENTUM
            </div>
            <h1>
              Good work
              <br />
              happens <em>together.</em>
            </h1>
            <p>
              Bring your projects, people, and priorities together in one calm
              place.
            </p>
            <div className="art-task-card">
              <div className="art-task-icon">✓</div>
              <div>
                <strong>Launch the new product page</strong>
                <small>Website redesign · Due Friday</small>
              </div>
              <span className="art-check">✓</span>
            </div>
            <div className="art-people">
              <div className="mini-avatars">
                <i>J</i>
                <i>M</i>
                <i>A</i>
                <i>+</i>
              </div>
              <span>Made for teams that move things forward</span>
            </div>
          </div>
        </div>
        <div className="auth-panel">
          <div className="auth-form-wrap">
            <div className="auth-mobile-brand">
              <div className="brand-mark">
                <Layers3 size={20} />
              </div>
              <span>teamflow</span>
            </div>
            <div className="auth-heading">
              <div className="auth-overline">YOUR TEAM, IN SYNC</div>
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
            <form onSubmit={onSubmit} className="form-stack">
              {children}
              <button className="btn primary auth-submit" disabled={busy}>
                {busy ? (
                  "Please wait…"
                ) : (
                  <>
                    {title === "Welcome back" ? "Sign in" : "Create account"}{" "}
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
            <div className="auth-footer">{footer}</div>
            <div className="auth-legal">
              By continuing, you agree to our{" "}
              <a href="#terms">Terms of Service</a> and{" "}
              <a href="#privacy">Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
      <div className="auth-bottom">
        © 2025 TeamFlow, Inc. <span>·</span> Made for teams everywhere
      </div>
    </main>
  );
}
export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  if (user) return <Navigate to="/" replace />;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      toast(err.response?.data?.message || "Could not sign in", "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      busy={busy}
      onSubmit={submit}
      footer={
        <>
          New to TeamFlow? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <label>
        Email address
        <input
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@company.com"
        />
      </label>
      <label>
        Password
        <input
          type="password"
          required
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Enter your password"
        />
      </label>
    </AuthShell>
  );
}
export function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  if (user) return <Navigate to="/" replace />;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      toast(
        err.response?.data?.message || "Could not create your account",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start organizing your team's work today."
      busy={busy}
      onSubmit={submit}
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <label>
        Your name
        <input
          required
          autoComplete="name"
          maxLength="80"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Alex Morgan"
        />
      </label>
      <label>
        Email address
        <input
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@company.com"
        />
      </label>
      <label>
        Password
        <input
          type="password"
          required
          minLength="8"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="At least 8 characters"
        />
        <small className="field-hint">Use at least 8 characters.</small>
      </label>
    </AuthShell>
  );
}
