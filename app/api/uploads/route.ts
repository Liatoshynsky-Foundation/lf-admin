import { NextRequest, NextResponse } from 'next/server';

import { config as appConfig } from '~/back-config';
import { initializeUploadModule } from '~/uploads/initialize';

const { uploadService } = initializeUploadModule(appConfig);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || undefined;

    const files = await uploadService.listFiles(folder);

    return NextResponse.json({ success: true, data: files });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ success: false, error: 'Failed to list files' }, { status: 500 });
  }
}
