import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./UseApi";
import { Navigate, useLocation } from "react-router-dom";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const axios = useMemo(() => api(), []);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("auth/me");
      setUser(res?.data?.user || null);
    } catch (err) {
      setUser(null);
      setError(err?.response?.data || err?.message || "Unauthenticated");
      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("role");
      }
    } finally {
      setLoading(false);
    }
  }, [axios]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    fetchMe();
  }, [fetchMe]);

  const isAuthenticated = !!localStorage.getItem("token") && !!user;

  const hasRole = useCallback(
    (roles) => {
      if (!user || !user.role) return false;
      const required = Array.isArray(roles) ? roles : [roles];
      return required.includes(user.role);
    },
    [user]
  );

  return {
    user,
    loading,
    error,
    isAuthenticated,
    hasRole,
    refresh: fetchMe,
  };
}

export function RequireAuth({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (roles && Array.isArray(roles)) {
    if (!user || !roles.includes(user.role)) {
      return <Navigate to="/" replace state={{ from: location }} />;
    }
  }

  return children;
}


