// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error('[error]', err?.message);
  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : (err.message || 'Request failed');
  res.status(status).json({ success: false, error: { message } });
}

export function notFound(req, res) {
  res.status(404).json({ success: false, error: { message: `Not found: ${req.method} ${req.path}` } });
}
