import fs from 'fs';
import path from 'path';
import winston from 'winston';
import LokiTransport from 'winston-loki'; // Import winston-loki

// Define the logs directory
const logDir = path.join(__dirname, 'logs');

// Check if the logs directory exists, and if not, create it
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create a new logger instance
const logger = winston.createLogger({
  level: 'info', // Set the logging level
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    // Add Loki transport
    new LokiTransport({
      host: 'http://localhost:3100', // URL of your Loki instance
      labels: { job: 'nodejs-application' }, // Labels for logs
    }),
  ],
});

// If we're not in production, log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
