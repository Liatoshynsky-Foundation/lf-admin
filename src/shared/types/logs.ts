export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export type LogMeta = {
  method?: string;
  url?: string;
  statusCode?: number;
  stack?: string;
  metadata?: Record<string, unknown>;
  raw?: Record<string, unknown>;
};

export type LogEntry = {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  meta: LogMeta;
};

export type LogsQuery = {
  level?: LogLevel | 'all';
  page: number;
  limit: number;
  from?: string;
  to?: string;
};

export type LogsResponse = {
  items: LogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};