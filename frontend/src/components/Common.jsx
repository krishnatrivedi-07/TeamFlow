import {
  LoaderCircle,
  Search,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createContext, useContext, useState } from "react";
const ToastContext = createContext(() => {});
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const notify = (message, type = "success") => {
    const id = Date.now();
    setItems((v) => [...v, { id, message, type }]);
    setTimeout(() => setItems((v) => v.filter((i) => i.id !== id)), 3500);
  };
  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast-stack">
        {items.map((i) => (
          <div className={`toast ${i.type}`} key={i.id}>
            {i.type === "error" ? (
              <AlertCircle size={17} />
            ) : (
              <CheckCircle2 size={17} />
            )}{" "}
            {i.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);
export function Spinner({ full = false }) {
  return (
    <div className={full ? "loading-full" : "loading-inline"}>
      <LoaderCircle className="spin" size={23} />
      <span>Loading…</span>
    </div>
  );
}
export function Empty({ icon: Icon = Search, title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={22} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className={`modal ${wide ? "modal-wide" : ""}`}>
        <header>
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
export function Button({ children, variant = "primary", ...props }) {
  return (
    <button className={`btn ${variant}`} {...props}>
      {children}
    </button>
  );
}
export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
