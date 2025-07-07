import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { BaseStatus, ContactMethod, WorkStatus } from '@prisma/client';
import { z } from 'zod';
import { 
  withApiMiddleware,
  AuthenticatedRequest 
} from '@/lib/api-middleware';
import {
  createSuccessResponse,
  createPaginatedResponse,
  parseJsonBody,
  parsePaginationParams,
  validateQueryParams,
  ValidationError
} from '@/lib/api-response';

// Define select fields for client queries
const clientSelectFields = {
  id: true,
  name: true,
  email: true,
  phone: true,
  website: true,
  address: true,
  billingAddress: true,
  taxId: true,
  contactPerson: true,
  contactEmail: true,
  contactPhone: true,
  industryId: true,
  industry: {
    select: {
      id: true,
      name: true,
      code: true
    }
  },
  status: true,
  preferredContactMethod: true,
  timezone: true,
  isVerified: true,
  notes: true,
  metadata: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      staff: {
        where: {
          deletedAt: null,
          status: WorkStatus.ACTIVE
        }
      }
    }
  }
};

// Validation schemas
const baseStatusEnum = z.enum(Object.values(BaseStatus) as [string, ...string[]]);
const contactMethodEnum = z.enum(Object.values(ContactMethod) as [string, ...string[]]);

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().url('Invalid website URL').optional().nullable(),
  address: z.string().optional().nullable(),
  billingAddress: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
  contactEmail: z.string().email('Invalid contact email').optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  industryId: z.string().optional().nullable(),
  status: baseStatusEnum.optional(),
  preferredContactMethod: contactMethodEnum.optional().nullable(),
  timezone: z.string().optional().nullable(),
  isVerified: z.boolean().optional(),
  notes: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

// GET handler - List clients with filtering and pagination
async function handleGetClients(request: AuthenticatedRequest) {
  const url = new URL(request.url);
  const { page, limit } = parsePaginationParams(url);
  const offset = (page - 1) * limit;

  // Parse query parameters
  const queryParams = validateQueryParams(url, {
    search: 'string',
    status: 'string',
    industryId: 'string',
    isVerified: 'boolean',
    preferredContactMethod: 'string',
    createdAfter: 'string',
    createdBefore: 'string',
    hasContract: 'boolean',
    hasStaff: 'boolean',
  });

  const {
    search,
    status,
    industryId,
    isVerified,
    preferredContactMethod,
    createdAfter,
    createdBefore,
    hasContract,
    hasStaff,
  } = queryParams;

  // Validate status if provided
  if (status && status !== 'all' && !Object.values(BaseStatus).includes(status as BaseStatus)) {
    throw new ValidationError(`Invalid status value. Must be one of: ${Object.values(BaseStatus).join(', ')}`);
  }

  // Build where clause
  const where: any = {
    deletedAt: null,
  };

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
      { contactPerson: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (status && status !== 'all') {
    where.status = status;
  }

  if (industryId) {
    where.industryId = industryId;
  }

  if (typeof isVerified === 'boolean') {
    where.isVerified = isVerified;
  }

  if (preferredContactMethod) {
    where.preferredContactMethod = preferredContactMethod;
  }

  if (createdAfter || createdBefore) {
    where.createdAt = {};
    if (createdAfter) where.createdAt.gte = new Date(createdAfter as string);
    if (createdBefore) where.createdAt.lte = new Date(createdBefore as string);
  }

  if (typeof hasContract === 'boolean') {
    if (hasContract) {
      where.contracts = { some: { deletedAt: null } };
    } else {
      where.contracts = { none: {} };
    }
  }

  if (typeof hasStaff === 'boolean') {
    if (hasStaff) {
      where.staff = { some: { deletedAt: null, status: WorkStatus.ACTIVE } };
    } else {
      where.staff = { none: {} };
    }
  }

  // Generate cache key
  const cacheKey = `clients:${JSON.stringify({ where, page, limit, select: clientSelectFields })}`;

  // Try to get from cache first
  const cachedResult = await cache.get(cacheKey);
  if (cachedResult && typeof cachedResult === 'object' && 'data' in cachedResult && 'metadata' in cachedResult) {
    const typedResult = cachedResult as { data: unknown[]; metadata: { total: number; page: number; limit: number; totalPages: number } };
    return createPaginatedResponse(
      typedResult.data,
      typedResult.metadata,
      'Clients retrieved successfully (cached)'
    );
  }

  // Fetch from database
  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      select: clientSelectFields,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.client.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const metadata = { total, page, limit, totalPages };

  // Cache the result
  await cache.set(cacheKey, { data: clients, metadata }, { ttl: 300 }); // 5 minutes

  return createPaginatedResponse(clients, metadata, 'Clients retrieved successfully');
}

// POST handler - Create new client
async function handleCreateClient(request: AuthenticatedRequest) {
  const body = await parseJsonBody(request);
  const validatedData = clientSchema.parse(body);

  // Convert null values to undefined for Prisma
  const createData = {
    ...validatedData,
    status: (validatedData.status as BaseStatus) || BaseStatus.ACTIVE,
    email: validatedData.email || undefined,
    phone: validatedData.phone || undefined,
    website: validatedData.website || undefined,
    address: validatedData.address || undefined,
    billingAddress: validatedData.billingAddress || undefined,
    taxId: validatedData.taxId || undefined,
    contactPerson: validatedData.contactPerson || undefined,
    contactEmail: validatedData.contactEmail || undefined,
    contactPhone: validatedData.contactPhone || undefined,
    industryId: validatedData.industryId || undefined,
    preferredContactMethod: validatedData.preferredContactMethod || undefined,
    timezone: validatedData.timezone || undefined,
    notes: validatedData.notes || undefined,
    metadata: validatedData.metadata || undefined,
  };

  const client = await prisma.client.create({
    data: createData as any, // Type assertion to work around complex Prisma types
    select: clientSelectFields,
  });

  // Clear relevant caches
  await cache.delete('clients:*');

  return createSuccessResponse(client, 'Client created successfully', 201);
}

// Export route handlers
export const GET = withApiMiddleware(handleGetClients, {
  allowedMethods: ['GET'],
});

export const POST = withApiMiddleware(handleCreateClient, {
  allowedMethods: ['POST'],
});