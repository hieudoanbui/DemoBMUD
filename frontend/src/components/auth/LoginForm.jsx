import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Fingerprint, KeyRound, LoaderCircle, ShieldCheck, TriangleAlert, UserRound, WandSparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { apiError } from '../../api/axiosClient';
import SecurityTabs from '../common/SecurityTabs';

export const LOGIN_PAYLOAD = { username: "admin' -- ", password: 'anything' };

export default function LoginForm({ mode, onModeChange, onTrace }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const secure = mode === 'secure';
  function changeMode(next) { setError(''); onModeChange(next); }
  function fill(values) { setUsername(values.username); setPassword(values.password); setError(''); onTrace(null); }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); onTrace(null);
    try {
      const data = await login(mode, { username, password });
      onTrace(data.trace);
      toast.success(data.user.authentication === 'injection-demo' ? 'Injection Demo Session được tạo từ kết quả MySQL.' : 'Đăng nhập thành công bằng tài khoản mẫu.');
      navigate('/products');
    } catch (err) {
      setError(apiError(err)); onTrace(err.response?.data?.trace || null); toast.error(apiError(err));
    } finally { setBusy(false); }
  }
  return <section className={`login-card panel ${mode}`}>
    <div className="login-card-intro"><span className={`form-icon ${mode}`}><Fingerprint size={25} /></span><div><h2>Đăng nhập vào lab</h2><p>Thử một đầu vào, quan sát cách SQL xử lý.</p></div></div>
    <SecurityTabs mode={mode} onChange={changeMode} subject="Login" disabled={busy} />
    <div className={`mode-explanation ${mode}`}>{secure ? <ShieldCheck size={16} /> : <TriangleAlert size={16} />}<span>{secure ? 'Prepared Statements · Input được xử lý như dữ liệu.' : 'String concatenation · Input được nối trực tiếp vào SQL.'}</span></div>
    <form onSubmit={submit} className="login-form">
      <label htmlFor="username">Username <span>01</span></label>
      <div className="input-wrap"><UserRound size={17} /><input id="username" name="username" placeholder="Nhập tên đăng nhập" autoComplete="username" value={username} maxLength={150} onChange={(e) => setUsername(e.target.value)} required disabled={busy} /></div>
      <label htmlFor="password">Password <span>02</span></label>
      <div className="input-wrap"><KeyRound size={17} /><input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Nhập mật khẩu" autoComplete="current-password" value={password} maxLength={255} onChange={(e) => setPassword(e.target.value)} required disabled={busy} /><button type="button" className="input-icon" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
      {error && <div className="form-error" role="alert"><TriangleAlert size={16} /><span>{error}</span></div>}
      <button className={`primary-button ${mode}`} type="submit" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={18} /> Đang truy vấn MySQL…</> : <><span>Login · {secure ? 'Secure' : 'Vulnerable'}</span><ArrowRight size={18} /></>}</button>
      <div className="sample-divider"><span /> DỮ LIỆU THỬ NGHIỆM <span /></div>
      <div className="sample-actions"><button type="button" className="secondary-button" onClick={() => fill({ username: 'admin', password: 'admin123' })} disabled={busy}><UserRound size={15} />Use Sample Account</button><button type="button" className="secondary-button payload-button" onClick={() => fill(LOGIN_PAYLOAD)} disabled={busy}><WandSparkles size={15} />Use SQL Injection</button></div>
      <p className="form-footnote">Các nút mẫu chỉ điền form. Nhấn Login để thực thi trên MySQL.</p>
    </form>
    <div className="lab-card-footnote"><ShieldCheck size={14} /> Dữ liệu giả · Session lab · Không cấp quyền quản trị</div>
  </section>;
}
