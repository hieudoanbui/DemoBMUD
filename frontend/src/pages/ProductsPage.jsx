import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { apiError } from '../api/axiosClient';
import { phoneApi } from '../api/phoneApi';
import SecurityTabs from '../components/common/SecurityTabs';
import SearchBar from '../components/phones/SearchBar';
import PhoneGrid from '../components/phones/PhoneGrid';

export default function ProductsPage() {
  const { expireSession } = useAuth();
  const [mode, setMode] = useState('vulnerable');
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
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
      setResult({ phones: data.phones, count: data.count });
    } catch (err) {
      if (axios.isCancel(err) || requestId !== sequence.current) return;
      if (err.response?.status === 401) { expireRef.current(); return; }
      setError(apiError(err));
    } finally { if (requestId === sequence.current) setBusy(false); }
  }, []);

  useEffect(() => {
    search(mode, ''); setQ('');
    return () => { controller.current?.abort(); sequence.current += 1; };
  }, [mode, search]);
  function changeMode(next) {
    if (next === mode) return;
    controller.current?.abort(); sequence.current += 1;
    setResult(null); setError(''); setQ(''); setBusy(true); setMode(next);
  }

  return <div className="site-width products-page">
    <div className="catalog-heading"><h1>Điện thoại</h1><p>Khám phá các sản phẩm mới nhất</p></div>
    <section className="search-panel" aria-label="Tìm sản phẩm"><SecurityTabs mode={mode} onChange={changeMode} subject="tìm kiếm" /><SearchBar value={q} onChange={setQ} onSubmit={() => search(mode, q)} busy={busy} /></section>
    <div className="results-heading" aria-live="polite"><h2>Tất cả sản phẩm</h2><span>{busy ? 'Đang tải…' : result ? `${result.count} sản phẩm` : ''}</span></div>
    {error && <div className="search-error" role="alert"><p>{error}</p><button type="button" className="sample-button" onClick={() => search(mode, q)}>Thử lại</button></div>}
    <PhoneGrid phones={result?.phones} busy={busy} error={error} />
  </div>;
}
