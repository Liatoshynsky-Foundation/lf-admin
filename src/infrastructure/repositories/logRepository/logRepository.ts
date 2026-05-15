import mongoose from 'mongoose';

import type { LogEntry, LogLevel, LogsQuery, LogsResponse } from '~/back-shared/types/logs';
import dbConnect from '~/infrastructure/db/connect';

type RawLogDocument = {
  _id: mongoose.Types.ObjectId | string;
  level?: string;
  message?: unknown;
  timestamp?: string | Date;
  date?: string | Date;
  method?: string;
  url?: string;
  statusCode?: number;
  stack?: string;
  meta?: unknown;
  metadata?: unknown;
  context?: unknown;
  [key: string]: unknown;
};

const ALLOWED_LEVELS: LogLevel[] = ['error', 'warn', 'info', 'debug'];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isAllowedLevel = (level: unknown): level is LogLevel => {
  return typeof level === 'string' && ALLOWED_LEVELS.includes(level as LogLevel);
};

const toDateString = (value: unknown): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string' && value) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }

  return new Date(0).toISOString();
};

const normalizeRawMeta = (value: unknown): Record<string, unknown> | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  return value;
};

const pickMetaValue = (sources: Array<Record<string, unknown> | undefined>, key: string): unknown => {
  for (const source of sources) {
    if (source && key in source) {
      return source[key];
    }
  }

  return undefined;
};

const normalizeLogDocument = (doc: RawLogDocument): LogEntry => {
  const metaSources = [normalizeRawMeta(doc.meta), normalizeRawMeta(doc.metadata), normalizeRawMeta(doc.context)];
  const raw = Object.fromEntries(
    Object.entries(doc).filter(([key]) => !['_id', 'level', 'message', 'timestamp', 'date', 'meta', 'metadata', 'context'].includes(key))
  );

  const method = pickMetaValue(metaSources, 'method') ?? doc.method;
  const url = pickMetaValue(metaSources, 'url') ?? doc.url;
  const statusCode = pickMetaValue(metaSources, 'statusCode') ?? doc.statusCode;
  const stack = pickMetaValue(metaSources, 'stack') ?? doc.stack;

  const metadata = metaSources.find(Boolean);

  return {
    id: String(doc._id),
    level: isAllowedLevel(doc.level) ? doc.level : 'info',
    message: typeof doc.message === 'string' ? doc.message : JSON.stringify(doc.message),
    timestamp: toDateString(doc.timestamp ?? doc.date),
    meta: {
      method: typeof method === 'string' ? method : undefined,
      url: typeof url === 'string' ? url : undefined,
      statusCode: typeof statusCode === 'number' ? statusCode : undefined,
      stack: typeof stack === 'string' ? stack : undefined,
      metadata,
      raw: Object.keys(raw).length > 0 ? raw : undefined
    }
  };
};

const parseDateFilter = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const normalizePagination = (page?: number, limit?: number) => ({
  page: Math.max(DEFAULT_PAGE, page ?? DEFAULT_PAGE),
  limit: Math.min(MAX_LIMIT, Math.max(1, limit ?? DEFAULT_LIMIT))
});

export const getLogs = async (query: Partial<LogsQuery> = {}): Promise<LogsResponse> => {
  await dbConnect();

  const { page, limit } = normalizePagination(query.page, query.limit);
  const skip = (page - 1) * limit;
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error('Database connection is not available');
  }

  const filters: Record<string, unknown> = {};

  if (query.level && query.level !== 'all') {
    filters.level = query.level;
  }

  const from = parseDateFilter(query.from);
  const to = parseDateFilter(query.to);
  if (from || to) {
    filters.timestamp = {};
    if (from) {
      (filters.timestamp as Record<string, Date>).$gte = from;
    }
    if (to) {
      (filters.timestamp as Record<string, Date>).$lte = to;
    }
  }

  const collection = db.collection<RawLogDocument>('logger');
  const [items, total] = await Promise.all([
    collection.find(filters).sort({ timestamp: -1, _id: -1 }).skip(skip).limit(limit).toArray(),
    collection.countDocuments(filters)
  ]);

  return {
    items: items.map(normalizeLogDocument),
    pagination: {
      page,
      limit,
      total
    }
  };
};
