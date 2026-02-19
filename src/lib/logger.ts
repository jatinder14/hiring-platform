
/**
 * Simple logger utility to control output based on environment.
 * In production, debug and info logs can be suppressed or formatted differently.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const isProduction = process.env.NODE_ENV === 'production';

const formatMessage = (level: LogLevel, ...args: any[]) => {
    return [`[${level.toUpperCase()}]`, ...args];
};

export const logger = {
    info: (...args: any[]) => {
        if (!isProduction) {
            console.log(...formatMessage('info', ...args));
        }
    },
    warn: (...args: any[]) => {
        console.warn(...formatMessage('warn', ...args));
    },
    error: (...args: any[]) => {
        console.error(...formatMessage('error', ...args));
    },
    debug: (...args: any[]) => {
        if (!isProduction) {
            console.debug(...formatMessage('debug', ...args));
        }
    }
};
