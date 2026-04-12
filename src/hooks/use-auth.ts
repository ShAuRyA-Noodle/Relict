import { useState, useEffect, useCallback } from "react";
import { getMe, login, signup, logout as apiLogout, getAccessToken, type UserPublic } from "@/lib/api";

export function useAuth() {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const handleSignup = async (email: string, password: string) => {
    setError(null);
    try {
      await signup(email, password);
      await checkAuth();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Signup failed";
      setError(msg);
      throw e;
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    try {
      await login(email, password);
      await checkAuth();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Login failed";
      setError(msg);
      throw e;
    }
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
  };

  return { user, loading, error, signup: handleSignup, login: handleLogin, logout: handleLogout, isAuthenticated: !!user };
}
