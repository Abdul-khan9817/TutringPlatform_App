type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
}

function formatEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  }
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry = formatEntry(level, message, context)

  // In production, output structured JSON
  if (process.env.NODE_ENV === 'production') {
    // Never log sensitive fields
    const safe = { ...context }
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'cardNumber', 'cvv']
    sensitiveKeys.forEach((k) => delete safe[k])
    console[level === 'debug' ? 'log' : level](JSON.stringify({ ...entry, context: safe }))
  } else {
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`
    if (level === 'error') {
      console.error(prefix, message, context ?? '')
    } else if (level === 'warn') {
      console.warn(prefix, message, context ?? '')
    } else {
      console.log(prefix, message, context ?? '')
    }
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
}
