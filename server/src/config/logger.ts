/**
 * Minimal, dependency-free leveled logger.
 * Kept tiny on purpose — swap for pino/winston later without touching call sites.
 */
type Level = 'info' | 'warn' | 'error' | 'debug';

const colors: Record<Level, string> = {
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  debug: '\x1b[90m',
};
const reset = '\x1b[0m';

function log(level: Level, message: unknown, ...meta: unknown[]): void {
  const ts = new Date().toISOString();
  const tag = `${colors[level]}[${level.toUpperCase()}]${reset}`;
  const sink = level === 'debug' ? console.log : console[level];
  sink(`${ts} ${tag}`, message, ...meta);
}

export const logger = {
  info: (m: unknown, ...meta: unknown[]) => log('info', m, ...meta),
  warn: (m: unknown, ...meta: unknown[]) => log('warn', m, ...meta),
  error: (m: unknown, ...meta: unknown[]) => log('error', m, ...meta),
  debug: (m: unknown, ...meta: unknown[]) => log('debug', m, ...meta),
};
