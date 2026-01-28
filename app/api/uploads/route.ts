import { NextRequest, NextResponse } from 'next/server';

import { config as appConfig } from '~/back-config';
import { initializeUploadModule } from '~/uploads/initialize';

let uploadModule: ReturnType<typeof initializeUploadModule> | null = null;

const getUploadModule = () => {
  uploadModule ??= initializeUploadModule(appConfig);
  return uploadModule;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || undefined;

    const files = await getUploadModule().uploadService.listFiles(folder);

    return NextResponse.json({ success: true, data: files });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ success: false, error: 'Failed to list files' }, { status: 500 });
  }
}
