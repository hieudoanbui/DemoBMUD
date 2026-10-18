import { ShieldCheck, TriangleAlert } from 'lucide-react';

export default function SecurityTabs({ mode, onChange, subject, disabled = false }) {
  return <div className="security-tabs" role="group" aria-label={`Chế độ ${subject}`}>
    {['vulnerable', 'secure'].map((value) => {
      const Icon = value === 'secure' ? ShieldCheck : TriangleAlert;
      return <button type="button" key={value} className={`mode-tab ${value} ${mode === value ? 'active' : ''}`}
        aria-pressed={mode === value} disabled={disabled} onClick={() => onChange(value)}>
        <Icon size={16} />{value === 'secure' ? 'Secure' : 'Vulnerable'} {subject}
        <span className="mode-dot" />
      </button>;
    })}
  </div>;
}
