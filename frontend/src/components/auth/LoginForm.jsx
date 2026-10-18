import { useState } from 'react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { apiError } from '../../api/axiosClient';
import SecurityTabs from '../common/SecurityTabs';

export const LOGIN_PAYLOAD = { username: "admin' -- ", password: 'anything' };

export default function LoginForm({ mode, onModeChange }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  function changeMode(next) { setError(''); onModeChange(next); }
  function fill(values) { setUsername(values.username); setPassword(values.password); setShowPassword(false); setError(''); }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await login(mode, { username, password });
      toast.success('Đăng nhập thành công');
      navigate('/products');
    } catch (err) { setError(apiError(err)); }
    finally { setBusy(false); }
  }
  return <section className="login-card" aria-labelledby="login-title">
    <div className="login-card-heading"><h1 id="login-title">Đăng nhập</h1><p>Chào mừng bạn quay trở lại</p></div>
    <SecurityTabs mode={mode} onChange={changeMode} subject="đăng nhập" disabled={busy} />
    <form onSubmit={submit} className="login-form">
      <div className="form-field"><label htmlFor="username">Username</label><input id="username" name="username" placeholder="Nhập tên đăng nhập" autoComplete="username" value={username} maxLength={150} onChange={(e) => setUsername(e.target.value)} required disabled={busy} /></div>
      <div className="form-field"><label htmlFor="password">Password</label><div className="password-field"><input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Nhập mật khẩu" autoComplete="current-password" value={password} maxLength={255} onChange={(e) => setPassword(e.target.value)} required disabled={busy} /><button type="button" className="input-icon" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button login-submit" type="submit" disabled={busy}>{busy && <LoaderCircle className="spin" size={17} />}{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
      <div className="sample-actions"><button type="button" className="secondary-button" onClick={() => fill({ username: 'admin', password: 'admin123' })} disabled={busy}>Tài khoản mẫu</button><button type="button" className="secondary-button" onClick={() => fill(LOGIN_PAYLOAD)} disabled={busy}>Điền mẫu SQLi</button></div>
    </form>
  </section>;
}
