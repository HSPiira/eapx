import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from './logger';

// Standard API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  message?: string;
}

export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Error types
export class ApiError extends Error {
  public statusCode: number;
  public errors?: string[];

  constructor(message: string, statusCode: number = 500, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, errors?: string[]) {
    super(message, 400, errors);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * Creates a standardized paginated success response
 */
export function createPaginatedResponse<T>(
  data: T[],
  metadata: PaginatedApiResponse<T>['metadata'],
  message?: string
): NextResponse<PaginatedApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    metadata,
    message,
  });
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  errors?: string[]
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      errors,
    },
    { status }
  );
}

/**
 * Handles different types of errors and returns appropriate responses
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  logger.error('API Error occurred', error);

  // Handle custom API errors
  if (error instanceof ApiError) {
    return createErrorResponse(error.message, error.statusCode, error.errors);
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
    return createErrorResponse('Validation failed', 400, errors);
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return createErrorResponse('A record with this data already exists', 409);
      case 'P2025':
        return createErrorResponse('Record not found', 404);
      case 'P2003':
        return createErrorResponse('Foreign key constraint failed', 400);
      case 'P2014':
        return createErrorResponse('Invalid relationship data', 400);
      default:
        return createErrorResponse('Database operation failed', 500);
    }
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return createErrorResponse('Invalid data provided', 400);
  }

  // Handle unknown errors
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal server error';
    return createErrorResponse(message, 500);
  }

  // Fallback for non-Error objects
  return createErrorResponse('An unexpected error occurred', 500);
}

/**
 * Wraps an API handler with error handling
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Validates request method
 */
export function validateMethod(request: Request, allowedMethods: string[]): void {
  if (!allowedMethods.includes(request.method)) {
    throw new ApiError(`Method ${request.method} not allowed`, 405);
  }
}

/**
 * Parses and validates JSON body
 */
export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    const body = await request.json();
    return body as T;
  } catch (error) {
    throw new ValidationError('Invalid JSON body');
  }
}

/**
 * Extracts and validates URL parameters
 */
export function validateParams(
  params: Record<string, string | string[]>,
  required: string[]
): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const key of required) {
    const value = params[key];
    if (!value || Array.isArray(value)) {
      throw new ValidationError(`Missing or invalid parameter: ${key}`);
    }
    result[key] = value;
  }
  
  return result;
}

/**
 * Extracts and validates query parameters
 */
export function validateQueryParams(
  url: URL,
  optional: Record<string, 'string' | 'number' | 'boolean'> = {}
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [key, type] of Object.entries(optional)) {
    const value = url.searchParams.get(key);
    if (value !== null) {
      switch (type) {
        case 'number':
          const num = parseInt(value, 10);
          if (isNaN(num)) {
            throw new ValidationError(`Invalid number parameter: ${key}`);
          }
          result[key] = num;
          break;
        case 'boolean':
          result[key] = value === 'true';
          break;
        case 'string':
        default:
          result[key] = value;
          break;
      }
    }
  }
  
  return result;
}

/**
 * Helper for pagination parameters
 */
export function parsePaginationParams(url: URL): { page: number; limit: number } {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10)));
  
  return { page, limit };
}