import { NextRequest, NextResponse } from 'next/server';

import { EventService } from '~/application/use-cases/eventService/eventService';
import dbConnect from '~/infrastructure/db/connect';
import { EventRepository } from '~/infrastructure/repositories/eventRepository/eventRepository';
import { EventStatus } from '~/types/enums/common.enums';
import { verifyAuth } from '~/utils/verifyAuth';

const eventRepository = EventRepository();
const eventService = EventService({ eventRepository });

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const filters = {
      status: (searchParams.get('status') as EventStatus) || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      limit: parseInt(searchParams.get('limit') || '100'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    const events = await eventService.getAll(filters);

    return NextResponse.json({
      success: true,
      data: events,
      total: events.length
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await verifyAuth(request);
    if (authError) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const event = await eventService.create(body);

    return NextResponse.json(
      {
        success: true,
        data: event
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
