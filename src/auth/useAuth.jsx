import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ CHECK SESSION ON APP LOAD
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setLoading(false);
      return;
    }

    // Make sure token is attached
    api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

    api.get("/auth/me")
      .then((res) => {
        const data = res.data.data;
        // ✅ Strip token from user object if present
        const { token, ...userOnly } = data;
        setUser(userOnly);
      })
      .catch(() => {
        // Token is stale — clean up
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ LOGIN
  const login = async ({ email, password }) => {
    const res = await api.post("/auth/login", { email, password });
    const userData = res.data.data;

    if (userData.token) {
      localStorage.setItem("token", userData.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
    }

    // ✅ Store user WITHOUT token mixed in
    const { token, ...userOnly } = userData;
    setUser(userOnly);
    return userOnly; // Login.jsx uses this for role redirect
  };

  // ✅ LOGOUT
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);