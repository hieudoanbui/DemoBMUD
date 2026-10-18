import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';

export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    authApi.me().then(({ data }) => { if (active) setUser(data.user); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function login(mode, credentials) {
    const { data } = await authApi.login(mode, credentials);
    setUser(data.user);
    return data;
  }
  async function logout() {
    await authApi.logout();
    setUser(null);
  }
  function expireSession() { setUser(null); }
  return <AuthContext.Provider value={{ user, loading, login, logout, expireSession }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
