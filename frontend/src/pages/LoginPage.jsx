import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  const [mode, setMode] = useState('vulnerable');
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading" role="status">Đang tải…</div>;
  if (user) return <Navigate to="/products" replace />;
  return <div className="login-page"><LoginForm mode={mode} onModeChange={setMode} /></div>;
}
