import { Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ to = '/' }) {
  return <Link to={to} className="brand" aria-label="PhoneStore — Trang chủ">
    <span className="brand-icon"><Smartphone size={20} strokeWidth={1.8} /></span>
    <span>Phone<span className="brand-accent">Store</span></span>
  </Link>;
}
