export function notFound(req, res, next) {
  const err = new Error(`Not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

export function errorHandler(err, req, res, next) {
  // Mongo duplicate key
  if (err.code === 11000) {
    return res.status(409).json({ message: "A record with that value already exists." });
  }

  // Mongoose validation / cast errors come back as 400
  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({ message: err.message });
  }

  const status = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  if (status === 500) {
    console.error("[500]", err);
  }

  res.status(status).json({
    message: status === 500 ? "Internal server error." : err.message,
  });
}
