import { NextRequest, NextResponse } from 'next/server';

import { getUploadModule } from './upload-handler';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || undefined;

    const files = await getUploadModule().uploadService.listFiles(folder);

    return NextResponse.json({ success: true, data: files });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to list files' }, { status: 500 });
  }
}
