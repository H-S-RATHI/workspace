type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export const createLogger = (context: string) => {
  const log = (level: LogLevel, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'production' && level === 'debug') {
      return; // Skip debug logs in production
    }
    
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] [${level.toUpperCase()}] [${context}]`;
    
    switch (level) {
      case 'error':
        console.error(message, ...args);
        break;
      case 'warn':
        console.warn(message, ...args);
        break;
      case 'info':
        console.info(message, ...args);
        break;
      case 'debug':
      default:
        console.debug(message, ...args);
    }
  };

  return {
    debug: (...args: unknown[]) => log('debug', ...args),
    info: (...args: unknown[]) => log('info', ...args),
    warn: (...args: unknown[]) => log('warn', ...args),
    error: (...args: unknown[]) => log('error', ...args),
  };
};

export const logger = createLogger('App');
