export function authMiddleware(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Vui lòng đăng nhập để xem sản phẩm.', code: 'UNAUTHENTICATED' });
  next();
}
