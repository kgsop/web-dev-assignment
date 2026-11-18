function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({
      message: err.message,
      errors: err.errors
        ? Object.values(err.errors).map((error) => error.message)
        : undefined
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }

  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error(err);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
}

module.exports = errorHandler;
