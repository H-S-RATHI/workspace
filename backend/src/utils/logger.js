// Simple console-only logger implementation
class Logger {
  constructor() {
    // Disable file logging
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  // No-op file writer
  writeToFile() {
    // Intentionally do nothing
    return;
  }

  info(message, meta = {}) {
    const formattedMessage = this.formatMessage('info', message, meta);
    console.log(formattedMessage);
  }

  warn(message, meta = {}) {
    const formattedMessage = this.formatMessage('warn', message, meta);
    console.warn(formattedMessage);
  }

  error(message, meta = {}) {
    const formattedMessage = this.formatMessage('error', message, meta);
    console.error(formattedMessage);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = this.formatMessage('debug', message, meta);
      console.debug(formattedMessage);
    }
  }
}

const logger = new Logger();

module.exports = { logger };