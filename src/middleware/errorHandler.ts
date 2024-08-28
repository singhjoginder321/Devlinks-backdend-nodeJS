import { Request, Response } from 'express';
import logger from '../utils/logger';

// Define the error handler middleware
const errorHandler = (
  err: any, // You can replace `any` with a more specific error type if needed
  req: Request,
  res: Response
): void => {
  // Log the error
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );

  // Respond with error details
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
};

export default errorHandler;
