import { NextResponse } from 'next/server';

export async function GET() {
  const clientAppUrl = process.env.CLIENT_BASE_URL;
  return NextResponse.json({ clientAppUrl });
}
