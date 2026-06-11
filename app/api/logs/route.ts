import { NextRequest, NextResponse } from 'next/server';

import type { LogLevel } from '~/back-shared/types/logs';
import { deleteLogs, getLogs } from '~/infrastructure/repositories/logRepository/logRepository';
import { createTokenService } from '~/src/application/use-cases/tokenService/createToken.service';
import { ACCESS_TOKEN_COOKIE_NAME } from '~/src/constants';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const level = parseLevel(searchParams.get('level'));
    const page = parsePositiveInteger(searchParams.get('page'), 1);
    const limit = parsePositiveInteger(searchParams.get('limit'), 20);
    const from = searchParams.get('from') ?? undefined;
    const to = searchParams.get('to') ?? undefined;

    const data = await getLogs({ level, page, limit, from, to });

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load logs';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<Response> {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    createTokenService().verifyAccessToken(accessToken);
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const level = parseLevel(request.nextUrl.searchParams.get('level'));
    const levelFilter = level && level !== 'all' ? level : undefined;

    const deletedCount = await deleteLogs(levelFilter);

    return NextResponse.json({ deletedCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to clear logs';
    return NextResponse.json({ message }, { status: 500 });
  }
}
