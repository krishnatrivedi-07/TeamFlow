import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  UsersRound,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  Layers3,
  UserRound,
  Building2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/workspaces", label: "Workspaces", icon: UsersRound },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
];
export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const profileTriggerRef = useRef(null);
  const profileMenuRef = useRef(null);
  const initials = user?.name
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  useEffect(() => {
    if (!profileOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        profileTriggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    profileMenuRef.current?.querySelector('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  const handleProfileMenuKeyDown = (event) => {
    const items = Array.from(
      profileMenuRef.current?.querySelectorAll('[role="menuitem"]') || [],
    );
    const currentIndex = items.indexOf(document.activeElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const offset = event.key === "ArrowDown" ? 1 : -1;
      items[(currentIndex + offset + items.length) % items.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/login", { replace: true });
  };
  const title =
    nav.find((n) => n.to === location.pathname)?.label ||
    (location.pathname.includes("/workspaces/")
      ? "Workspace"
      : location.pathname.includes("/projects/")
        ? "Project"
        : "Settings");
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Layers3 size={20} />
          </div>
          <span>teamflow</span>
          <span className="brand-dot">.</span>
          <button className="mobile-close" onClick={() => setMobile(false)}>
            ×
          </button>
        </div>
        <div className="workspace-switch">
          <div className="workspace-avatar">T</div>
          <div>
            <strong>Team workspace</strong>
            <small>Free plan</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {nav.map((item) => (
            <NavLink
              end={item.to === "/"}
              to={item.to}
              key={item.to}
              onClick={() => setMobile(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.to === "/tasks" && <span className="nav-shortcut">⌘K</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="upgrade-card">
          <div className="upgrade-spark">✦</div>
          <strong>Keep your team in sync</strong>
          <p>All your projects, people, and priorities in one place.</p>
          <span className="upgrade-link">
            Explore TeamFlow <span>→</span>
          </span>
        </div>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-link settings-link ${isActive ? "active" : ""}`
          }
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
        <div className="sidebar-profile">
          <div className="avatar">{user?.name?.slice(0, 1).toUpperCase()}</div>
          <div className="profile-copy">
            <strong>{user?.name}</strong>
            <small>{user?.email}</small>
          </div>
          <button title="Log out" className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMobile(!mobile)}>
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <span>Workspace</span>
            <b>/</b>
            <strong>{title}</strong>
          </div>
          <div className="topbar-right">
            <div className="search-hint">
              <span>⌕</span> Search anything <kbd>⌘ K</kbd>
            </div>
            <div className="profile-menu-root" ref={profileRef}>
              <button
                ref={profileTriggerRef}
                type="button"
                className="topbar-avatar profile-trigger"
                aria-label={`Open profile menu${user?.name ? ` for ${user.name}` : ""}`}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-controls="profile-dropdown"
                onClick={() => setProfileOpen((open) => !open)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    setProfileOpen(true);
                  }
                }}
              >
                {initials}
              </button>
              {profileOpen && (
                <div
                  id="profile-dropdown"
                  ref={profileMenuRef}
                  className="profile-dropdown"
                  role="menu"
                  aria-label="Profile menu"
                  onKeyDown={handleProfileMenuKeyDown}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget))
                      setProfileOpen(false);
                  }}
                >
                  <div className="profile-menu-user">
                    <div className="profile-menu-avatar" aria-hidden="true">
                      {initials}
                    </div>
                    <div className="profile-menu-identity">
                      <strong>{user?.name}</strong>
                      <span>{user?.email}</span>
                    </div>
                  </div>
                  <div className="profile-menu-divider" />
                  <Link
                    to="/settings#profile"
                    role="menuitem"
                    tabIndex={0}
                    className="profile-menu-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <UserRound size={16} /> <span>My Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    role="menuitem"
                    tabIndex={-1}
                    className="profile-menu-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={16} /> <span>Account Settings</span>
                  </Link>
                  <Link
                    to="/workspaces"
                    role="menuitem"
                    tabIndex={-1}
                    className="profile-menu-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Building2 size={16} /> <span>My Workspace</span>
                  </Link>
                  <div className="profile-menu-divider profile-menu-divider-bottom" />
                  <button
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    className="profile-menu-item profile-menu-logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} /> <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
      {mobile && (
        <div className="mobile-scrim" onClick={() => setMobile(false)} />
      )}
    </div>
  );
}
