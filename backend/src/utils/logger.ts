/**
 * CYPHRA Logger
 *
 * Structured, timestamped logger with log levels and optional request IDs.
 * In production, replace with a proper library (pino, winston) if needed.
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

function log(level: LogLevel, msg: string, meta?: unknown): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${level}] ${timestamp}`;

  if (meta !== undefined) {
    const serialized =
      meta instanceof Error
        ? { message: meta.message, stack: meta.stack }
        : meta;

    if (level === 'ERROR') {
      console.error(`${prefix} — ${msg}`, serialized);
    } else if (level === 'WARN') {
      console.warn(`${prefix} — ${msg}`, serialized);
    } else {
      console.log(`${prefix} — ${msg}`, serialized);
    }
  } else {
    if (level === 'ERROR') {
      console.error(`${prefix} — ${msg}`);
    } else if (level === 'WARN') {
      console.warn(`${prefix} — ${msg}`);
    } else {
      console.log(`${prefix} — ${msg}`);
    }
  }
}

export const logger = {
  debug: (msg: string, meta?: unknown): void => {
    if (process.env.NODE_ENV !== 'production') {
      log('DEBUG', msg, meta);
    }
  },
  info: (msg: string, meta?: unknown): void => log('INFO', msg, meta),
  warn: (msg: string, meta?: unknown): void => log('WARN', msg, meta),
  error: (msg: string, meta?: unknown): void => log('ERROR', msg, meta),
};
