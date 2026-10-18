import { useId } from 'react';
import { ArrowUpRight, Circle, HardDrive, Package, TriangleAlert } from 'lucide-react';

const palettes = {
  Apple: ['#d1bda6', '#504943', '#f1ddc4'],
  Samsung: ['#9ba5b2', '#2c3445', '#d8e1f2'],
  Xiaomi: ['#6bada1', '#1b4b45', '#b0e2cf'],
  OPPO: ['#51596c', '#171c32', '#9da3c2'],
  'Google Pixel': ['#daa7af', '#7a344e', '#fbe0d9'],
};

function PhoneIllustration({ brand, name }) {
  const id = useId().replace(/:/g, '');
  const [body, screen, light] = palettes[brand] || palettes.Apple;
  const pixel = brand === 'Google Pixel';
  return <svg className="phone-illustration" viewBox="0 0 280 200" role="img" aria-label={`Minh họa ${name}`}>
    <defs><linearGradient id={`${id}body`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={light} /><stop offset="1" stopColor={body} /></linearGradient><linearGradient id={`${id}screen`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={screen} /><stop offset="1" stopColor={body} /></linearGradient><radialGradient id={`${id}glow`}><stop stopColor={light} stopOpacity=".9" /><stop offset="1" stopColor={screen} stopOpacity="0" /></radialGradient></defs>
    <ellipse cx="142" cy="182" rx="65" ry="7" fill="currentColor" opacity=".08" />
    <g transform="translate(76 20) rotate(-12 43 78)"><rect x="0" y="0" width="83" height="155" rx="16" fill={`url(#${id}body)`} stroke={body} strokeWidth="1.5" /><rect x="4" y="4" width="75" height="147" rx="13" fill="none" stroke="white" opacity=".25" />
      {pixel ? <><rect x="4" y="20" width="75" height="28" rx="12" fill={screen} opacity=".7" />{[20, 38, 56].map((x) => <circle key={x} cx={x} cy="34" r="7" fill="#171b21" stroke={body} strokeWidth="2" />)}</> : <><rect x="8" y="9" width="42" height="46" rx="11" fill={body} />{[[21, 22], [38, 34], [21, 45]].map(([x, y]) => <g key={y}><circle cx={x} cy={y} r="8" fill="#24272b" stroke={light} strokeWidth="1.5" /><circle cx={x - 2} cy={y - 2} r="2.5" fill="#52606b" /></g>)}<circle cx="39" cy="16" r="3" fill={light} /></>}
      <text x="41" y="99" textAnchor="middle" fontSize={pixel ? '21' : '9'} fontFamily="system-ui" fontWeight="600" fill={screen} opacity=".5">{pixel ? 'G' : brand === 'Apple' ? '●' : brand.toUpperCase()}</text>
    </g>
    <g transform="translate(133 15) rotate(11 42 78)"><rect width="83" height="158" rx="16" fill="#1f242a" stroke={body} strokeWidth="2" /><rect x="4" y="4" width="75" height="150" rx="12" fill={`url(#${id}screen)`} /><ellipse cx="24" cy="110" rx="65" ry="60" fill={`url(#${id}glow)`} /><path d="M4 132C36 89 61 112 79 55v55c-26 2-31 44-75 29Z" fill={light} opacity=".25" /><path d="M4 128C29 91 56 103 79 60" stroke={light} opacity=".45" strokeWidth="1.5" fill="none" />{brand === 'Apple' ? <rect x="27" y="9" width="30" height="8" rx="5" fill="#181c22" /> : <circle cx="42" cy="11" r="3" fill="#181c22" />}<rect x="27" y="148" width="29" height="2" rx="1" fill="white" opacity=".5" /></g>
  </svg>;
}

export default function PhoneCard({ phone }) {
  const hidden = phone.status === 'off';
  return <article className={`phone-card ${hidden ? 'exposed' : ''}`}>
    <div className="phone-visual"><span className="phone-brand-label">{phone.brand}</span><span className={`stock-dot ${hidden ? 'hidden-stock' : ''}`}><span />{hidden ? 'HIDDEN' : 'PUBLIC'}</span><PhoneIllustration brand={phone.brand} name={phone.name} /><span className="illustration-caption">ẢNH MINH HỌA · DỮ LIỆU LAB</span></div>
    <div className="phone-details">{hidden && <div className="hidden-badge"><TriangleAlert size={13} /> HIDDEN – EXPOSED BY SQL INJECTION</div>}<div className="phone-name-row"><h3>{phone.name}</h3><ArrowUpRight size={15} aria-hidden="true" /></div><div className="phone-specs"><span><HardDrive size={12} />{phone.storage}</span><span><Circle size={10} />{phone.color}</span></div><p className="phone-description">{phone.description}</p><div className="phone-price-row"><strong>{new Intl.NumberFormat('vi-VN').format(Number(phone.price))}<small>₫</small></strong><span><Package size={12} />{phone.quantity} máy</span></div></div>
  </article>;
}
