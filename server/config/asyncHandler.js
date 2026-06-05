// Wraps async route handlers so we don't need try/catch everywhere.
// Any thrown error gets forwarded to Express's error middleware.
export default function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
