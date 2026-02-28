import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import api from "../config/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("token");
      const storedUser = await SecureStore.getItemAsync("user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      }
    } catch (e) {
      console.log("Auth load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    const { token: t, user: u, message } = res.data;
    await SecureStore.setItemAsync("token", t);
    await SecureStore.setItemAsync("user", JSON.stringify(u));
    api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return { user: u, message };
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    const { token: t, user: u, message } = res.data;
    await SecureStore.setItemAsync("token", t);
    await SecureStore.setItemAsync("user", JSON.stringify(u));
    api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return { user: u, message };
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
