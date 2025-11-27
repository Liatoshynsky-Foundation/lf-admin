import { NextRequest, NextResponse } from 'next/server';

import { EventService } from '~/application/use-cases/eventService/eventService';
import dbConnect from '~/infrastructure/db/connect';
import { EventRepository } from '~/infrastructure/repositories/eventRepository/eventRepository';

const eventRepository = EventRepository();
const eventService = EventService({ eventRepository });

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await dbConnect();

    const event = await eventService.getBySlug(params.slug);

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: event
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
