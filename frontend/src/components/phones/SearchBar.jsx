import { LoaderCircle, Search, WandSparkles } from 'lucide-react';
export const SEARCH_PAYLOAD = "' OR 1=1 -- ";

export default function SearchBar({ value, onChange, onSubmit, busy }) {
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }} className="search-form">
    <label htmlFor="phone-search" className="search-label">TÌM KIẾM SẢN PHẨM</label>
    <div className="search-row"><div className="input-wrap"><Search size={19} /><input id="phone-search" placeholder="Tìm điện thoại theo tên…" value={value} maxLength={200} onChange={(event) => onChange(event.target.value)} disabled={busy} /></div><button className="primary-button" disabled={busy} type="submit">{busy ? <LoaderCircle size={17} className="spin" /> : <Search size={17} />}<span>{busy ? 'Đang tìm…' : 'Search'}</span></button></div>
    <div className="search-samples"><span>THỬ NHANH</span><button type="button" className="text-button" onClick={() => onChange('iPhone')} disabled={busy}><Search size={13} />Use Sample Search</button><button type="button" className="text-button payload-button" onClick={() => onChange(SEARCH_PAYLOAD)} disabled={busy}><WandSparkles size={13} />Use SQL Injection</button><span className="search-sample-note">Điền input, sau đó nhấn Search.</span></div>
  </form>;
}
