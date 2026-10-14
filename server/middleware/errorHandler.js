/**
 * 404 handler for routes that do not match any defined endpoint
 */
export const notFound = (req, res, next) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl} - Route not found` });
};

/**
 * Centralized error-handling middleware.
 * Catches all errors passed via next(error) or thrown in middleware.
 */
export const errorHandler = (err, req, res, next) => {
  // Catch malformed JSON bodies sent by the client
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON format in request body" });
  }

  console.error("Unhandled Error:", err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    error: err.message || "Internal server error",
  });
};
