export const LOGIN_TEMPLATE = 'SELECT id, username FROM users WHERE username = ? AND password = ? LIMIT 1';
export const PHONE_FIELDS = 'id, name, brand, price, storage, color, quantity, status, description';
// No parentheses: the sample OR payload deliberately changes this predicate.
export const SEARCH_TEMPLATE = `SELECT ${PHONE_FIELDS} FROM phones WHERE status = 'on' AND name LIKE ? ORDER BY id`;

function displayTrace({ mode, input, template, segments, parameters, result, explanation }) {
  return { mode, input, template, segments, statement: segments.map((s) => s.text).join(''), parameters, result, explanation };
}

export async function loginQuery(db, mode, { username, password }) {
  let rows;
  let segments;
  if (mode === 'vulnerable') {
    // INTENTIONAL SQL INJECTION, local-only educational lab. Never reuse in production.
    const sql = `SELECT id, username FROM users WHERE username = '${username}' AND password = '${password}' LIMIT 1`;
    [rows] = await db.query(sql);
    segments = [
      { text: "SELECT id, username FROM users WHERE username = '", kind: 'sql' },
      { text: username, kind: 'input' },
      { text: "' AND password = '", kind: 'sql' },
      { text: '••••••••', kind: 'redacted' },
      { text: "' LIMIT 1", kind: 'sql' },
    ];
  } else {
    [rows] = await db.execute(LOGIN_TEMPLATE, [username, password]);
    segments = [{ text: LOGIN_TEMPLATE, kind: 'sql' }];
  }
  // Determine provenance from an actual prepared credential check, not payload detection.
  // No roles or admin capabilities are granted by this lab's sessions.
  let validCredentials = mode === 'secure' && rows.length > 0;
  if (mode === 'vulnerable' && rows.length) {
    const [verified] = await db.execute(LOGIN_TEMPLATE, [username, password]);
    validCredentials = verified.some((user) => user.id === rows[0].id);
  }
  const authenticated = rows.length > 0;
  const authentication = validCredentials ? 'credentials' : 'injection-demo';
  const user = authenticated ? { id: rows[0].id, username: rows[0].username, authentication, labSession: true } : null;
  const explanation = !authenticated
    ? (mode === 'secure' ? 'Không khớp tài khoản. Prepared Statement giữ nguyên cấu trúc SQL: input chỉ là dữ liệu.' : 'MySQL không trả về tài khoản phù hợp với điều kiện truy vấn.')
    : validCredentials ? 'Thông tin đăng nhập khớp dữ liệu mẫu trong MySQL.'
      : 'Truy vấn ghép chuỗi trả về tài khoản nhưng Prepared Statement kiểm tra cùng thông tin không khớp. Đây là Injection Demo Session, không có quyền quản trị.';
  return {
    user,
    trace: displayTrace({ mode, input: { username, password: '••••••••' },
      template: LOGIN_TEMPLATE, segments, parameters: mode === 'secure' ? [username, '••••••••'] : null,
      result: { matchedRows: rows.length, authenticated, ...(authenticated && { authentication }) }, explanation }),
  };
}

export async function searchQuery(db, mode, q) {
  let rows;
  let segments;
  if (mode === 'vulnerable') {
    // INTENTIONAL SQL INJECTION, never use outside this localhost lab.
    const sql = `SELECT ${PHONE_FIELDS} FROM phones WHERE status = 'on' AND name LIKE '%${q}%' ORDER BY id`;
    [rows] = await db.query(sql);
    segments = [
      { text: `SELECT ${PHONE_FIELDS} FROM phones WHERE status = 'on' AND name LIKE '%`, kind: 'sql' },
      { text: q, kind: 'input' }, { text: "%' ORDER BY id", kind: 'sql' },
    ];
  } else {
    [rows] = await db.execute(SEARCH_TEMPLATE, [`%${q}%`]);
    segments = [{ text: SEARCH_TEMPLATE, kind: 'sql' }];
  }
  const hiddenCount = rows.filter((row) => row.status === 'off').length;
  const exposed = mode === 'vulnerable' && hiddenCount > 0;
  return {
    phones: rows, count: rows.length, hiddenCount, exposed,
    trace: displayTrace({ mode, input: { q }, template: SEARCH_TEMPLATE, segments,
      parameters: mode === 'secure' ? [`%${q}%`] : null,
      result: { rows: rows.length, publicRows: rows.length - hiddenCount, hiddenRows: hiddenCount },
      explanation: exposed ? 'SQL Injection succeeded: hidden products were exposed. Điều kiện OR đã thay đổi bộ lọc status trong truy vấn thực tế.'
        : mode === 'secure' ? 'MySQL nhận từ khóa dưới dạng parameter. Dấu nháy và từ khóa SQL nằm trong dữ liệu, không thay đổi bộ lọc status = on.'
          : 'MySQL trả về kết quả truy vấn ghép chuỗi. Chưa có sản phẩm ẩn nào xuất hiện trong kết quả này.' }),
  };
}
