import { LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { useAuth } from '../../contexts/AuthContext';
import { apiError } from '../../api/axiosClient';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  async function handleLogout() {
    setBusy(true);
    try { await logout(); toast.success('Đã đăng xuất'); navigate('/login'); }
    catch (error) { toast.error(apiError(error)); }
    finally { setBusy(false); }
  }
  return <div className="app-shell">
    <header className="site-header"><div className="site-width header-content">
      <Logo />
      {user && <nav className="store-nav" aria-label="Điều hướng chính">
        <NavLink to="/" end>Trang chủ</NavLink><NavLink to="/products">Điện thoại</NavLink>
      </nav>}
      <div className="header-actions">
        {user && <><span className="account-name" title={String(user.username)}>{user.username}</span>
          <button className="logout-button" onClick={handleLogout} disabled={busy} aria-label="Đăng xuất"><LogOut size={16} /><span>{busy ? 'Đang đăng xuất…' : 'Đăng xuất'}</span></button></>}
        <ThemeToggle />
      </div>
    </div></header>
    <main className={user ? 'store-main' : 'auth-main'}>{children}</main>
    <footer className="site-footer"><div className="site-width footer-content"><span>PhoneStore</span><span>Điện thoại cho mỗi ngày.</span></div></footer>
  </div>;
}
