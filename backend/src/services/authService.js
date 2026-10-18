import { promisify } from 'node:util';

export async function establishSession(req, user) {
  await promisify(req.session.regenerate).call(req.session);
  req.session.user = user;
  await promisify(req.session.save).call(req.session);
}

export async function destroySession(req) {
  await promisify(req.session.destroy).call(req.session);
}
