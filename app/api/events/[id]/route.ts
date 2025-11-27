import { NextRequest, NextResponse } from 'next/server';

import { EventService } from '~/application/use-cases/eventService/eventService';
import dbConnect from '~/infrastructure/db/connect';
import { EventRepository } from '~/infrastructure/repositories/eventRepository/eventRepository';
import { verifyAuth } from '~/utils/verifyAuth';

const eventRepository = EventRepository();
const eventService = EventService({ eventRepository });

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const event = await eventService.getById(params.id);

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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = await verifyAuth(request);
    if (authError) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const event = await eventService.update(params.id, body);

    return NextResponse.json({
      success: true,
      data: event
    });
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authError = await verifyAuth(request);
    if (authError) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const success = await eventService.delete(params.id);

    return NextResponse.json({
      success,
      message: 'Event deleted successfully'
    });
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
