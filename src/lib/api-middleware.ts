import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { 
  handleApiError, 
  validateMethod, 
  UnauthorizedError, 
  ForbiddenError,
  ApiResponse 
} from './api-response';

// Types for middleware
export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    roles?: string[];
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  };
}

export type ApiHandler<T = unknown> = (
  request: AuthenticatedRequest,
  context: { params: Record<string, string | string[]> }
) => Promise<NextResponse<ApiResponse<T>>>;

export type PublicApiHandler<T = unknown> = (
  request: NextRequest,
  context: { params: Record<string, string | string[]> }
) => Promise<NextResponse<ApiResponse<T>>>;

interface MiddlewareOptions {
  requireAuth?: boolean;
  allowedMethods?: string[];
  requiredRoles?: string[];
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

/**
 * Main API middleware that handles authentication, validation, and error handling
 */
export function withApiMiddleware<T = unknown>(
  handler: ApiHandler<T>,
  options: MiddlewareOptions = {}
) {
  const {
    requireAuth = true,
    allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    requiredRoles = [],
  } = options;

  return async (
    request: NextRequest,
    context: { params: Record<string, string | string[]> }
  ): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      // Validate HTTP method
      validateMethod(request, allowedMethods);

      // Handle authentication if required
      let authenticatedRequest: AuthenticatedRequest;
      
      if (requireAuth) {
        const token = await getToken({ 
          req: request, 
          secret: process.env.NEXTAUTH_SECRET 
        });

        if (!token || !token.sub) {
          throw new UnauthorizedError('Authentication required');
        }

        // Check user status
        if (token.status && token.status !== 'ACTIVE') {
          throw new ForbiddenError('Account is not active');
        }

        // Check required roles
        if (requiredRoles.length > 0) {
          const userRoles = token.roles as string[] || [];
          const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
          
          if (!hasRequiredRole) {
            throw new ForbiddenError('Insufficient permissions');
          }
        }

        // Create authenticated request
        authenticatedRequest = Object.assign(request, {
          user: {
            id: token.sub,
            email: token.email || '',
            roles: token.roles as string[] || [],
            status: token.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' || 'ACTIVE',
          }
        }) as AuthenticatedRequest;
      } else {
        // For public endpoints, create a mock authenticated request
        authenticatedRequest = Object.assign(request, {
          user: {
            id: '',
            email: '',
            roles: [],
            status: 'ACTIVE' as const,
          }
        }) as AuthenticatedRequest;
      }

      // Call the actual handler
      return await handler(authenticatedRequest, context);

    } catch (error) {
      return handleApiError(error) as NextResponse<ApiResponse<T>>;
    }
  };
}

/**
 * Middleware for public API endpoints (no authentication required)
 */
export function withPublicApiMiddleware<T = unknown>(
  handler: PublicApiHandler<T>,
  options: Pick<MiddlewareOptions, 'allowedMethods' | 'rateLimit'> = {}
) {
  const { allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] } = options;

  return async (
    request: NextRequest,
    context: { params: Record<string, string | string[]> }
  ): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      // Validate HTTP method
      validateMethod(request, allowedMethods);

      // Call the actual handler
      return await handler(request, context);

    } catch (error) {
      return handleApiError(error) as NextResponse<ApiResponse<T>>;
    }
  };
}

/**
 * Specific middleware for admin-only endpoints
 */
export function withAdminMiddleware<T = unknown>(
  handler: ApiHandler<T>,
  options: Omit<MiddlewareOptions, 'requireAuth' | 'requiredRoles'> = {}
) {
  return withApiMiddleware(handler, {
    ...options,
    requireAuth: true,
    requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
  });
}

/**
 * Middleware for endpoints that require specific permissions
 */
export function withPermissionMiddleware<T = unknown>(
  handler: ApiHandler<T>,
  permissions: string[],
  options: Omit<MiddlewareOptions, 'requireAuth' | 'requiredRoles'> = {}
) {
  return withApiMiddleware(handler, {
    ...options,
    requireAuth: true,
    requiredRoles: permissions,
  });
}

/**
 * Helper to extract user ID from authenticated request
 */
export function getUserId(request: AuthenticatedRequest): string {
  if (!request.user?.id) {
    throw new UnauthorizedError('User ID not found in request');
  }
  return request.user.id;
}

/**
 * Helper to check if user has specific role
 */
export function hasRole(request: AuthenticatedRequest, role: string): boolean {
  return request.user?.roles?.includes(role) || false;
}

/**
 * Helper to check if user has any of the specified roles
 */
export function hasAnyRole(request: AuthenticatedRequest, roles: string[]): boolean {
  if (!request.user?.roles) return false;
  return roles.some(role => request.user.roles!.includes(role));
}

/**
 * Helper to ensure user has permission to access resource
 */
export function ensureResourceAccess(
  request: AuthenticatedRequest,
  resourceUserId: string,
  allowedRoles: string[] = ['ADMIN', 'SUPER_ADMIN']
): void {
  const userId = getUserId(request);
  const isOwner = userId === resourceUserId;
  const hasPermission = hasAnyRole(request, allowedRoles);

  if (!isOwner && !hasPermission) {
    throw new ForbiddenError('Insufficient permissions to access this resource');
  }
}