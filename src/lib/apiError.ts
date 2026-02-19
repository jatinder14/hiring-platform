import { NextResponse } from 'next/server';

/**
 * Log error server-side and return a safe 500 JSON (no internal details to client).
 */
export function api500(
  message: string,
  logContext?: string,
  error?: unknown
): NextResponse {
  if (logContext && error !== undefined) {
    console.error(`[API] ${logContext}:`, error instanceof Error ? error.message : error);
  }
  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}
