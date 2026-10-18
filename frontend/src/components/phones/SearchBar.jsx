import { LoaderCircle, Search } from 'lucide-react';
export const SEARCH_PAYLOAD = "' OR 1=1 -- ";

export default function SearchBar({ value, onChange, onSubmit, busy }) {
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }} className="search-form">
    <label htmlFor="phone-search" className="sr-only">Tìm kiếm điện thoại</label>
    <div className="search-row"><div className="search-input"><Search size={18} aria-hidden="true" /><input id="phone-search" placeholder="Bạn đang tìm điện thoại nào?" value={value} maxLength={200} onChange={(event) => onChange(event.target.value)} disabled={busy} /></div><button className="primary-button" disabled={busy} type="submit">{busy && <LoaderCircle size={16} className="spin" />}{busy ? 'Đang tìm…' : 'Tìm kiếm'}</button></div>
    <div className="search-samples"><button type="button" className="sample-button" onClick={() => onChange('iPhone')} disabled={busy}>Tìm kiếm mẫu</button><span aria-hidden="true">·</span><button type="button" className="sample-button" onClick={() => onChange(SEARCH_PAYLOAD)} disabled={busy}>Điền mẫu SQLi</button></div>
  </form>;
}
