import { useCallback, useEffect, useRef, useState } from 'react';
import { Database, Fingerprint, PackageOpen, RefreshCw, ShieldCheck, ShoppingBag, TriangleAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { apiError } from '../api/axiosClient';
import { phoneApi } from '../api/phoneApi';
import SecurityTabs from '../components/common/SecurityTabs';
import SearchBar from '../components/phones/SearchBar';
import PhoneGrid from '../components/phones/PhoneGrid';
import QueryViewer from '../components/common/QueryViewer';

export default function ProductsPage() {
  const { user, loginTrace, expireSession } = useAuth();
  const [mode, setMode] = useState('vulnerable');
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [showLoginTrace, setShowLoginTrace] = useState(false);
  const controller = useRef(null);
  const sequence = useRef(0);
  const expireRef = useRef(expireSession);
  expireRef.current = expireSession;

  const search = useCallback(async (selectedMode, query) => {
    controller.current?.abort();
    const activeController = new AbortController();
    controller.current = activeController;
    const requestId = ++sequence.current;
    setBusy(true); setError(''); setResult(null);
    try {
      const { data } = await phoneApi.search(selectedMode, query, activeController.signal);
      if (requestId !== sequence.current) return;
      setResult(data);
      if (data.exposed && data.phones.some((phone) => phone.status === 'off')) toast('MySQL trả về sản phẩm ẩn trong truy vấn Vulnerable.', { icon: '⚠️' });
    } catch (err) {
      if (axios.isCancel(err) || requestId !== sequence.current) return;
      if (err.response?.status === 401) { expireRef.current(); return; }
      setError(apiError(err)); toast.error(apiError(err));
    } finally { if (requestId === sequence.current) setBusy(false); }
  }, []);

  useEffect(() => {
    search(mode, ''); setQ('');
    return () => { controller.current?.abort(); sequence.current += 1; };
  }, [mode, search]);
  function changeMode(next) {
    if (next === mode) return;
    // Clear synchronously with the mode update: never render the previous mode's
    // hidden rows or query trace under the Secure tab, even for one render.
    controller.current?.abort();
    sequence.current += 1;
    setResult(null); setError(''); setQ(''); setBusy(true); setMode(next);
  }
  const exposed = mode === 'vulnerable' && result?.phones.some((phone) => phone.status === 'off');
  return <div className="page products-page">
    <div className="page-eyebrow"><span className="eyebrow-line" /> MODULE 02 / PRODUCT SEARCH</div>
    <div className="page-title-row products-title"><div><h1>Cửa hàng điện thoại<span className="title-period">.</span></h1><p className="page-description">Một cửa hàng mẫu. Một bộ lọc công khai. Liệu input có thể thay đổi điều kiện SQL?</p></div><span className="store-mark"><ShoppingBag size={23} /><span>QUERY<span className="text-accent">STORE</span><small>THE LAB COLLECTION</small></span></span></div>
    <div className={`session-banner ${user.authentication === 'injection-demo' ? 'injection-session' : ''}`}><Fingerprint size={19} /><div><strong>{user.authentication === 'injection-demo' ? 'Injection Demo Session' : 'Đăng nhập bằng thông tin hợp lệ'}</strong><p>Tài khoản: {user.username} · Phiên học tập, không có quyền quản trị.</p></div>{loginTrace && <button className="text-button" onClick={() => setShowLoginTrace(!showLoginTrace)} aria-expanded={showLoginTrace}>{showLoginTrace ? 'Ẩn' : 'Xem'} SQL đăng nhập</button>}</div>
    {showLoginTrace && loginTrace && <div className="login-trace"><QueryViewer mode={loginTrace.mode} kind="login" trace={loginTrace} title="Login · SQL Query Viewer" /></div>}
    <div className="catalog-workbench"><div className="catalog-column">
      <section className={`search-panel panel ${mode}`}><div className="search-panel-header"><h2><PackageOpen size={18} /> Khám phá sản phẩm</h2><span className="mono-label">phones / MySQL</span></div><SecurityTabs mode={mode} onChange={changeMode} subject="Search" /><SearchBar value={q} onChange={setQ} onSubmit={() => search(mode, q)} busy={busy} /><div className="search-rule">{mode === 'secure' ? <ShieldCheck size={14} /> : <Database size={14} />}<span>{mode === 'secure' ? 'Prepared Statement giữ nguyên điều kiện' : 'Truy vấn ghép chuỗi với điều kiện'} <code>status = 'on'</code></span></div></section>
      {error && <div className="notice warning" role="alert"><TriangleAlert size={19} /><div><strong>Không thể tải kết quả</strong><p>{error}</p><button className="text-button" onClick={() => search(mode, q)}><RefreshCw size={13} /> Thử lại</button></div></div>}
      {exposed && <div className="notice danger" role="status"><TriangleAlert size={21} /><div><strong>SQL Injection succeeded: hidden products were exposed.</strong><p>MySQL trả về {result.hiddenCount} sản phẩm OFF. Bộ lọc trạng thái đã bị thay đổi bởi truy vấn Vulnerable.</p></div></div>}
      <div className="results-heading"><div><h2>Bộ sưu tập điện thoại</h2><span>{busy ? 'Đang truy vấn MySQL…' : result ? `${result.count} kết quả từ database` : 'Chưa có kết quả'}</span></div>{result && <span className={`result-pill ${exposed ? 'is-exposed' : ''}`}>{exposed ? `${result.hiddenCount} hidden exposed` : 'Public products only'}</span>}</div>
      <PhoneGrid phones={result?.phones} busy={busy} error={error} />
      <p className="catalog-footnote">6 sản phẩm ON · 4 sản phẩm OFF trong seed chuẩn. Số kết quả phía trên luôn lấy từ MySQL.</p>
    </div><aside className="catalog-inspector"><QueryViewer mode={mode} kind="search" trace={result?.trace} collapsible /><div className="inspector-note"><ShieldCheck size={17} /><p>Chuyển chế độ sẽ xóa kết quả cũ và truy vấn lại danh sách công khai.</p></div></aside></div>
  </div>;
}
