export function invalid(message) {
  const error = new Error(message);
  error.status = 400;
  error.code = 'INVALID_INPUT';
  error.publicMessage = message;
  return error;
}

export function loginInput(body) {
  const { username, password } = body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password
      || username.length > 150 || password.length > 255 || /[\x00-\x1f\x7f]/.test(username + password)) {
    throw invalid('Username (1–150 ký tự) và password (1–255 ký tự) phải là chuỗi không chứa ký tự điều khiển.');
  }
  return { username, password };
}

export function searchInput(query) {
  const q = query.q ?? '';
  if (typeof q !== 'string' || q.length > 200 || /[\x00-\x1f\x7f]/.test(q)) {
    throw invalid('Từ khóa phải là chuỗi tối đa 200 ký tự, không chứa ký tự điều khiển.');
  }
  return q;
}
