import { logger } from './logger';

export class AppError extends Error {
  public code: string;
  public status: number;
  public details?: unknown;

  constructor(message: string, code: string, status: number = 400, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Standard error response format:
 * { error: string, code: string, details?: unknown }
 */
export function errorResponse(error: AppError | Error) {
  if (error instanceof AppError) {
    return Response.json(
      { error: error.message, code: error.code, ...(error.details ? { details: error.details } : {}) },
      { status: error.status }
    );
  }
  logger.error('Unhandled error', { error: String(error) });
  return Response.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}

/** Shortcut for common error patterns */
export function unauthorizedResponse(message = 'Unauthorized') {
  return Response.json({ error: message, code: 'UNAUTHORIZED' }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden') {
  return Response.json({ error: message, code: 'FORBIDDEN' }, { status: 403 });
}

export function notFoundResponse(message = 'Not found') {
  return Response.json({ error: message, code: 'NOT_FOUND' }, { status: 404 });
}

export function badRequestResponse(message: string, details?: unknown) {
  return Response.json({ error: message, code: 'VALIDATION_ERROR', ...(details ? { details } : {}) }, { status: 400 });
}
