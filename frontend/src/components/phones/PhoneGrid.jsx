import { SearchX } from 'lucide-react';
import PhoneCard from './PhoneCard';

export default function PhoneGrid({ phones, busy, error }) {
  if (busy) return <div className="phone-grid" aria-label="Đang tải sản phẩm">{[1, 2, 3, 4, 5, 6].map((n) => <div className="phone-skeleton" key={n}><div /><span /><span /></div>)}</div>;
  if (error) return null;
  if (!phones) return null;
  if (!phones.length) return <div className="empty-state"><SearchX size={30} /><h3>Không tìm thấy sản phẩm</h3><p>Vui lòng thử một từ khóa khác.</p></div>;
  return <div className="phone-grid">{phones.map((phone, i) => <PhoneCard key={`${phone.id}-${i}`} phone={phone} />)}</div>;
}
