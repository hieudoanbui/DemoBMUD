import { ArrowUpRight, BookOpen, Braces, ChevronRight, FlaskConical, KeyRound, LockKeyhole, LogOut, Radio, Shield, ShoppingBag } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';
import { apiError } from '../../api/axiosClient';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  async function handleLogout() {
    setBusy(true);
    try { await logout(); toast.success('Đã đăng xuất và xóa session.'); navigate('/login'); }
    catch (error) { toast.error(apiError(error)); }
    finally { setBusy(false); }
  }
  return <div className="app-shell">
    <aside className="sidebar">
      <NavLink to={user ? '/products' : '/login'} className="brand" aria-label="QueryLab trang chính"><span className="brand-icon"><Braces size={24} /></span><span>Query<span className="text-accent">Lab</span><small>ATTACK & DEFENSE</small></span></NavLink>
      <div className="sidebar-body">
        <p className="nav-caption">WORKSPACE</p>
        <nav aria-label="Điều hướng chính">
          <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive && !user ? 'selected' : ''}`}><KeyRound size={18} /><span>Authentication</span><span className="nav-number">01</span></NavLink>
          {user ? <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'selected' : ''}`}><ShoppingBag size={18} /><span>Product Search</span><span className="nav-number">02</span></NavLink>
            : <span className="nav-link disabled" aria-disabled="true"><ShoppingBag size={18} /><span>Product Search</span><LockKeyhole size={13} /></span>}
        </nav>
        <div className="sidebar-lesson"><BookOpen size={19} /><h3>Học bằng cách quan sát.</h3><p>Cùng một đầu vào.<br />Hai cách xử lý SQL.<br />Khác biệt nằm ở truy vấn.</p><span className="lesson-tag">SQL INJECTION LAB <ArrowUpRight size={12} /></span></div>
      </div>
      <div className="sidebar-bottom"><div className="local-indicator"><span /> LOCAL ENVIRONMENT</div><p>Dữ liệu mẫu · Không có quyền quản trị</p><div className="sidebar-version"><span>QueryLab / v1.0</span><Shield size={14} /></div></div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <div className="breadcrumb"><FlaskConical size={16} /><span>Security Lab</span><ChevronRight size={13} /><strong>{user ? 'Product Search' : 'Authentication'}</strong></div>
        <div className="topbar-actions"><span className="lab-badge"><Radio size={13} /> LAB ONLY</span><span className="topbar-divider" /><ThemeToggle />{user && <><div className="user-chip"><span className="avatar">{String(user.username).slice(0, 1).toUpperCase()}</span><span>{user.username}<small>{user.authentication === 'injection-demo' ? 'Injection Demo Session' : 'Lab account'}</small></span></div><button className="icon-button" onClick={handleLogout} disabled={busy} title="Logout" aria-label="Logout"><LogOut size={17} /></button></>}</div>
      </header>
      <main>{children}</main>
      <footer className="workspace-footer"><span><span className="footer-dot" /> Built for learning. Kept on localhost.</span><span>SQL Injection · Attack & Defense</span></footer>
    </div>
  </div>;
}
