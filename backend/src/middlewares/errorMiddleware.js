export function errorMiddleware(error, _req, res, _next) {
  if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Dữ liệu gửi lên quá lớn.', code: 'INPUT_TOO_LARGE' });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON không hợp lệ.', code: 'INVALID_JSON' });
  if (error.publicMessage) return res.status(error.status || 400).json({ error: error.publicMessage, code: error.code || 'INVALID_INPUT' });
  // Never forward SQL-driver messages, queries, connection details or stack traces.
  const queryError = ['ER_PARSE_ERROR', 'ER_BAD_FIELD_ERROR', 'ER_WRONG_NUMBER_OF_COLUMNS_IN_SELECT', 'ER_MIX_OF_GROUP_FUNC_AND_FIELDS'].includes(error.code);
  return res.status(queryError ? 400 : 503).json({
    error: queryError ? 'MySQL từ chối câu truy vấn. Kiểm tra cú pháp đầu vào trong lab.' : 'Không thể truy cập MySQL. Kiểm tra cấu hình Aiven, TLS và dữ liệu schema/seed ở backend.',
    code: queryError ? 'QUERY_REJECTED' : 'DATABASE_UNAVAILABLE',
  });
}
