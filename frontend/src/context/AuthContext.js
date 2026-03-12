import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("closeloop_token");
    if (storedToken) {
      setAuthHeader(storedToken);
    }
    return storedToken;
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setAuthHeader(token);
      try {
        const response = await axios.get(`${API}/auth/me`);
        setUser(response.data);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("closeloop_token");
        setAuthHeader(null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem("closeloop_token", access_token);
    setAuthHeader(access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  }, []);

  const signup = useCallback(async (email, password, name, companyName) => {
    const response = await axios.post(`${API}/auth/signup`, {
      email, password, name, company_name: companyName
    });
    const { access_token, user: userData } = response.data;
    localStorage.setItem("closeloop_token", access_token);
    setAuthHeader(access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("closeloop_token");
    setAuthHeader(null);
    setToken(null);
    setUser(null);
  }, []);

  const isSuperuser = user?.role === "superuser";
  const isSuperadmin = user?.role === "superadmin";
  const isAdmin = user?.role === "superadmin" || user?.role === "superuser";

  const value = {
    user, token, loading,
    login, signup, logout,
    isSuperuser, isSuperadmin, isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
