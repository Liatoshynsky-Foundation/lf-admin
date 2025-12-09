import { NextRequest, NextResponse } from 'next/server';

import { config as appConfig } from '~/back-config';
import { initializeUploadModule } from '~/uploads/initialize';

const uploadModule = initializeUploadModule(appConfig);

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const { filename } = params;

    if (!filename) {
      return NextResponse.json({ success: false, error: 'Filename is required' }, { status: 400 });
    }

    const metadata = await uploadModule.uploadService.getFileMetadata(filename);

    if (!metadata) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: metadata
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Metadata retrieval error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
