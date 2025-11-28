import { NextRequest, NextResponse } from 'next/server';

import { EventService } from '~/application/use-cases/eventService/eventService';
import dbConnect from '~/infrastructure/db/connect';
import { EventRepository } from '~/infrastructure/repositories/eventRepository/eventRepository';
import { verifyAuth } from '~/utils/verifyAuth';

const eventRepository = EventRepository();
const eventService = EventService({ eventRepository });

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = await verifyAuth(request);
    if (authError) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const event = await eventService.archive(params.id);

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event archived successfully'
    });
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
