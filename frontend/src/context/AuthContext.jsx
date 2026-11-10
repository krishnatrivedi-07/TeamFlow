import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem("teamflow_token")) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem("teamflow_token"))
      .finally(() => setLoading(false));
  }, []);
  const login = async (values) => {
    const { data } = await api.post("/auth/login", values);
    localStorage.setItem("teamflow_token", data.token);
    setUser(data.user);
  };
  const register = async (values) => {
    const { data } = await api.post("/auth/register", values);
    localStorage.setItem("teamflow_token", data.token);
    setUser(data.user);
  };
  const logout = () => {
    localStorage.removeItem("teamflow_token");
    setUser(null);
  };
  const refresh = async () => {
    const { data } = await api.get("/auth/me");
    setUser(data.user);
  };
  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
