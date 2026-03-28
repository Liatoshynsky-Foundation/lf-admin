import { NextRequest, NextResponse } from 'next/server';

import { getUploadModule, RouteParams } from '~/api/uploads/upload-handler';

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = await params;
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || undefined;

    const metadata = await getUploadModule().uploadService.getFileMetadata(filename, folder);

    if (!metadata) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: metadata }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
