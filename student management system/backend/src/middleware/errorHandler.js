const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log for developer
  console.error('\x1b[31m%s\x1b[0m', 'ERROR Log:', err);

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new Error(message);
    error.statusCode = 404;
  }

  // Mongoose Duplicate Key Error (MongoServerError code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered: '${err.keyValue[field]}' for field '${field}'. Please use another value.`;
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new Error(message);
    error.statusCode = 400;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid authorization token. Access denied.';
    error = new Error(message);
    error.statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    const message = 'Authorization token has expired.';
    error = new Error(message);
    error.statusCode = 401;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Internal Server Error'
  });
};

export default errorHandler;
