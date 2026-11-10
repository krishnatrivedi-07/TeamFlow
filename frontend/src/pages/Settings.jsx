import { useEffect, useState } from "react";
import { Save, UserRound, ShieldCheck } from "lucide-react";
import { PageHeading, Button, useToast } from "../components/Common";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
export default function Settings() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user]);
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.patch("/auth/profile", { name, email });
      await refresh();
      toast("Profile updated");
    } catch (err) {
      toast(err.response?.data?.message || "Could not update profile", "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeading
        eyebrow="YOUR ACCOUNT"
        title="Settings"
        description="Manage your personal profile and account details."
      />
      <div className="settings-layout">
        <aside className="settings-nav">
          <div className="settings-nav-item selected">
            <UserRound size={17} /> Profile
          </div>
          <div className="settings-nav-item">
            <ShieldCheck size={17} /> Account security
          </div>
        </aside>
        <section className="panel settings-panel" id="profile">
          <div className="settings-section-head">
            <div className="settings-avatar">
              {user?.name?.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2>Personal information</h2>
              <p>Update the name and email linked to your account.</p>
            </div>
          </div>
          <form className="form-stack settings-form" onSubmit={save}>
            <label>
              Full name
              <input
                required
                maxLength="80"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Email address
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <div className="settings-note">
              <ShieldCheck size={17} />
              <span>
                Your password is securely hashed. Password changes can be added
                from account security.
              </span>
            </div>
            <div className="form-actions">
              <Button disabled={busy}>
                {busy ? (
                  "Saving…"
                ) : (
                  <>
                    <Save size={15} /> Save changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
