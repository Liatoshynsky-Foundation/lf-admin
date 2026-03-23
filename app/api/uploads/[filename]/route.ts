import { NextRequest, NextResponse } from 'next/server';

import { getUploadModule, RouteParams } from '../upload-handler';

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = await params;
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder');

    if (!folder) {
      return NextResponse.json(
        { success: false, error: 'Folder parameter is required' },
        { status: 400 }
      );
    }

    const fileBuffer = await getUploadModule().uploadService.retrieveFile(filename, folder);

    if (!fileBuffer) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    const metadata = await getUploadModule().uploadService.getFileMetadata(filename, folder);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': metadata?.mimeType || 'application/octet-stream',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = await params;
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || undefined;

    const success = await getUploadModule().uploadService.deleteFile(filename, folder);

    if (!success) {
      return NextResponse.json({ success: false, error: 'Failed to delete file' }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
