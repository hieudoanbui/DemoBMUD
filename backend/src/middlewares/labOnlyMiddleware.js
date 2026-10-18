const loopback = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
const localHost = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;

export function localOnly(config) {
  const allowedOrigins = new Set([
    config.frontendUrl,
    `http://localhost:${config.port}`,
    `http://127.0.0.1:${config.port}`,
  ]);
  return (req, res, next) => {
    if (!loopback.has(req.socket.remoteAddress) || !localHost.test(req.headers.host || '')
        || ['forwarded', 'x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto'].some((h) => req.headers[h])) {
      return res.status(403).json({ error: 'Ứng dụng lab chỉ cho phép kết nối trực tiếp qua localhost.', code: 'LOCAL_ONLY' });
    }
    const origin = req.headers.origin;
    if ((origin && !allowedOrigins.has(origin)) || (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !origin)) {
      return res.status(403).json({ error: 'Origin không được phép truy cập lab.', code: 'ORIGIN_REJECTED' });
    }
    next();
  };
}

export function labOnlyMiddleware(config) {
  return (_req, res, next) => {
    if (!config.labMode) return res.status(403).json({ error: 'Endpoint Vulnerable bị tắt. Chỉ bật LAB_MODE=true trong lab.', code: 'LAB_DISABLED' });
    next();
  };
}
