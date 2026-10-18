import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Copy, Database, FileCode2, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

const templates = {
  login: 'SELECT id, username FROM users WHERE username = ? AND password = ? LIMIT 1',
  search: "SELECT id, name, brand, price, storage, color, quantity, status, description FROM phones WHERE status = 'on' AND name LIKE ? ORDER BY id",
};

function SqlSyntax({ text }) {
  return text.split(/('[^']*'|\b(?:SELECT|FROM|WHERE|AND|OR|LIKE|ORDER BY|LIMIT|AS|BY)\b|\?)/gi).map((token, i) =>
    <span key={i} className={/^'/.test(token) ? 'sql-string' : /^(SELECT|FROM|WHERE|AND|OR|LIKE|ORDER BY|LIMIT|AS|BY|\?)$/i.test(token) ? 'sql-keyword' : ''}>{token}</span>);
}

export default function QueryViewer({ mode, kind, trace, collapsible = false, title = 'SQL Query Viewer' }) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(trace?.statement || templates[kind]);
      setCopied(true);
      toast.success('Đã copy SQL (mật khẩu được che).');
      setTimeout(() => setCopied(false), 1800);
    } catch { toast.error('Không thể truy cập clipboard trong trình duyệt này.'); }
  }
  return <section className="query-viewer panel" aria-label={title}>
    <div className="panel-heading">
      <div className="flex items-center gap-2"><Terminal size={17} className="text-accent" /><h2>{title}</h2></div>
      <div className="flex items-center gap-2">
        <span className={`live-label ${trace ? 'has-result' : ''}`}>{trace ? 'EXECUTED' : 'AWAITING INPUT'}</span>
        {collapsible && <button className="icon-button small" onClick={() => setOpen(!open)} aria-label={open ? 'Ẩn chi tiết SQL' : 'Hiện chi tiết SQL'} aria-expanded={open}>{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>}
      </div>
    </div>
    {open && <div className="query-content">
      <div className="query-section">
        <div className="query-label"><span>01</span> INPUT NGƯỜI DÙNG</div>
        <pre className="input-preview">{trace ? JSON.stringify(trace.input, null, 2) : '// Gửi form để xem input đã thực thi\n// Password luôn được che'}</pre>
      </div>
      <div className="query-section">
        <div className="query-label"><span>02</span> SQL QUERY TEMPLATE</div>
        <pre className="sql-code template"><SqlSyntax text={trace?.template || templates[kind]} /></pre>
      </div>
      <div className="query-section">
        <div className="flex items-center justify-between gap-2">
          <div className="query-label"><span>03</span> {mode === 'secure' ? 'STATEMENT + PARAMETERS' : kind === 'login' ? 'SQL GHÉP CHUỖI · ĐÃ CHE PASSWORD' : 'SQL GHÉP CHUỖI THỰC TẾ'}</div>
          <button type="button" className="copy-button" onClick={copy} aria-label="Copy SQL">{copied ? <Check size={13} /> : <Copy size={13} />} Copy SQL</button>
        </div>
        <div className="code-window">
          <div className="code-toolbar"><span className="code-dots"><i /><i /><i /></span><span>{mode === 'secure' ? 'prepared-statement.sql' : 'concatenated-query.sql'}</span><FileCode2 size={13} /></div>
          <pre className="sql-code">{trace ? trace.segments.map((segment, i) => segment.kind === 'input'
            ? <mark key={i} className="sql-input" title="Input được nối trực tiếp vào SQL">{segment.text}</mark>
            : segment.kind === 'redacted' ? <span key={i} className="sql-redacted">{segment.text}</span>
              : <SqlSyntax key={i} text={segment.text} />)
            : <span className="code-empty">{'// Chưa có truy vấn được thực thi.\n// Kết quả sẽ đến từ MySQL, không giả lập.'}</span>}</pre>
        </div>
        {trace?.parameters && <div className="parameters"><span>PARAMETERS</span><code>{JSON.stringify(trace.parameters)}</code></div>}
        {kind === 'login' && <p className="micro-copy">SQL hiển thị đã che giá trị password; Copy SQL cũng dùng bản đã che.</p>}
      </div>
      <div className={`database-result ${trace ? mode : ''}`}>
        <div className="query-label"><Database size={14} /> DATABASE RESULT</div>
        {trace ? <><pre>{JSON.stringify(trace.result, null, 2)}</pre><p>{trace.explanation}</p></>
          : <p>Chưa thực thi. Nhập dữ liệu và gửi form để quan sát kết quả truy vấn thực tế.</p>}
      </div>
    </div>}
  </section>;
}
