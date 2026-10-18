import { useState } from 'react';
import { ArrowDown, ArrowRight, Database, FlaskConical, LockKeyhole, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import QueryViewer from '../components/common/QueryViewer';

export default function LoginPage() {
  const [mode, setMode] = useState('vulnerable');
  const [trace, setTrace] = useState(null);
  const { user, loading, initialError } = useAuth();
  if (loading) return <div className="page-loading" role="status">Đang kiểm tra session…</div>;
  if (user) return <Navigate to="/products" replace />;
  function changeMode(next) { setMode(next); setTrace(null); }
  return <div className="page login-page">
    <div className="page-eyebrow"><span className="eyebrow-line" /> MODULE 01 / AUTHENTICATION</div>
    <div className="page-title-row"><div><h1>Một câu truy vấn.<br /><span>Hai kết quả khác biệt.</span></h1><p className="page-description">Khám phá cách SQL Injection vượt qua xác thực — và cách<br className="desktop-break" /> Prepared Statements giữ dữ liệu ở đúng vị trí của nó.</p></div><div className="hero-emblem" aria-hidden="true"><LockKeyhole size={42} /><span className="emblem-orbit orbit-1" /><span className="emblem-orbit orbit-2" /><i /><b>SQL</b></div></div>
    <div className="lesson-strip"><span><FlaskConical size={16} /> Thực hành có kiểm soát</span><span><Database size={16} /> MySQL queries thật</span><span><ShieldCheck size={16} /> So sánh Attack & Defense</span></div>
    {initialError && <div className="notice warning" role="status"><TriangleAlert size={18} /><div><strong>Backend chưa sẵn sàng</strong><p>{initialError} Không có kết quả database giả lập.</p></div></div>}
    <div className="login-workbench">
      <div className="login-column"><LoginForm mode={mode} onModeChange={changeMode} onTrace={setTrace} /><div className="experiment-note"><span className="step-label">THỬ NGHIỆM NHANH</span><ol><li><span>1</span>Chọn <strong>Use SQL Injection</strong> rồi Login.</li><li><span>2</span>Chuyển sang Secure, dùng cùng payload.</li><li><span>3</span>So sánh SQL và kết quả từ MySQL.</li></ol><div><ArrowRight size={14} /> Đăng nhập thành công để mở Product Search.</div></div></div>
      <div className="viewer-column"><QueryViewer mode={mode} kind="login" trace={trace} /><div className="principle-card"><span className="principle-icon"><ShieldCheck size={20} /></span><div><h3>Dữ liệu không phải là câu lệnh.</h3><p>Prepared Statements tách cấu trúc truy vấn khỏi input. Cùng một payload sẽ được đọc như chuỗi ký tự, thay vì cú pháp SQL.</p></div><ArrowDown size={17} /></div></div>
    </div>
    <div className="local-notice"><TriangleAlert size={16} /><p>Chỉ dành cho học tập trên localhost. Không dùng dữ liệu thật hoặc đưa endpoint Vulnerable lên Internet.</p><span>CONTROLLED LAB</span></div>
  </div>;
}
