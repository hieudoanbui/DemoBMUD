export default function SecurityTabs({ mode, onChange, subject, disabled = false }) {
  return <div className="security-tabs" role="group" aria-label={`Chế độ ${subject}`}>
    {['vulnerable', 'secure'].map((value) => <button type="button" key={value}
      className={`mode-tab ${mode === value ? 'active' : ''}`} aria-pressed={mode === value}
      disabled={disabled} onClick={() => onChange(value)}>
      {value === 'secure' ? 'Secure' : 'Vulnerable'}
    </button>)}
  </div>;
}
