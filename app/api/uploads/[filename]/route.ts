import { NextRequest, NextResponse } from 'next/server';

import { config as appConfig } from '~/back-config';
import { initializeUploadModule } from '~/uploads/initialize';

const uploadModule = initializeUploadModule(appConfig);

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder');

    if (!filename) {
      return NextResponse.json({ success: false, error: 'Filename is required' }, { status: 400 });
    }

    if (!folder) {
      return NextResponse.json(
        { success: false, error: 'Folder parameter is required (e.g., ?folder=photos)' },
        { status: 400 }
      );
    }

    const fileBuffer = await uploadModule.uploadService.retrieveFile(filename, folder);

    if (!fileBuffer) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    const metadata = await uploadModule.uploadService.getFileMetadata(filename, folder);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': metadata?.mimeType || 'application/octet-stream',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('File retrieval error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder');

    if (!filename) {
      return NextResponse.json({ success: false, error: 'Filename is required' }, { status: 400 });
    }

    if (!folder) {
      return NextResponse.json(
        { success: false, error: 'Folder parameter is required (e.g., ?folder=photos)' },
        { status: 400 }
      );
    }

    const success = await uploadModule.uploadService.deleteFile(filename, folder);

    if (!success) {
      return NextResponse.json({ success: false, error: 'Failed to delete file' }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
