import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import { apiError } from '../api/axiosClient';

export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialError, setInitialError] = useState('');
  const [loginTrace, setLoginTrace] = useState(null);
  useEffect(() => {
    let active = true;
    authApi.me().then(({ data }) => { if (active) setUser(data.user); })
      .catch((error) => { if (active && error.response?.status !== 401) setInitialError(apiError(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function login(mode, credentials) {
    const { data } = await authApi.login(mode, credentials);
    setUser(data.user);
    setLoginTrace(data.trace);
    setInitialError('');
    return data;
  }
  async function logout() {
    await authApi.logout();
    setUser(null);
    setLoginTrace(null);
  }
  function expireSession() { setUser(null); setLoginTrace(null); }
  return <AuthContext.Provider value={{ user, loading, initialError, loginTrace, login, logout, expireSession }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
