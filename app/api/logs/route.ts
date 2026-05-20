import { NextResponse } from 'next/server';

import type { LogLevel } from '~/back-shared/types/logs';
import { getLogs } from '~/infrastructure/repositories/logRepository/logRepository';

const parsePositiveInteger = (value: string | null, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const LOG_LEVELS = new Set<LogLevel>(['error', 'warn', 'info', 'debug']);

const isLogLevel = (value: string): value is LogLevel => LOG_LEVELS.has(value as LogLevel);

const parseLevel = (value: string | null): LogLevel | 'all' | undefined => {
  if (!value) return undefined;
  if (value === 'all') return 'all';
  if (isLogLevel(value)) {
    return value;
  }
  return undefined;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const level = parseLevel(url.searchParams.get('level'));
    const page = parsePositiveInteger(url.searchParams.get('page'), 1);
    const limit = parsePositiveInteger(url.searchParams.get('limit'), 20);
    const from = url.searchParams.get('from') ?? undefined;
    const to = url.searchParams.get('to') ?? undefined;

    const data = await getLogs({ level, page, limit, from, to });

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load logs';
    return NextResponse.json({ message }, { status: 500 });
  }
}
