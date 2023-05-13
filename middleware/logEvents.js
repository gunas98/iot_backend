const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const DailyRotateFile = require('winston-daily-rotate-file');

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const transport = new DailyRotateFile({
  filename: './logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

transport.on('rotate', function (oldFilename, newFilename) {
  // do something fun
});

const logger = createLogger({
  format: combine(
    label({ label: 'application' }),
    timestamp(),
    myFormat
  ),
  transports: [
    transport
  ]
});


function logEvents(req, res, next) {
  // logger.info(`[${req.method}] ${req.url} --response`, {
  //   statusCode: res.statusCode,
  //   userAgent: req.headers['user-agent']
  // });

  res.on('finish', () => {
    logger.info(`[${req.method}] ${req.url}`, {
      statusCode: res.statusCode,
      userAgent: req.headers['user-agent']
    });
  });

  process.on('uncaughtException', function (err) {
    logger.error(err.stack);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, p) => {
    logger.error(`Unhandled Rejection at: Promise ${p}, reason: ${reason}`);
  });

  next();
}

module.exports = {
  logger,
  logEvents,
};