import { NextRequest, NextResponse } from 'next/server';

import { getUploadModule, parseFormDataOptions } from '~/api/uploads/upload-handler';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files uploaded' }, { status: 400 });
    }

    const options = parseFormDataOptions(formData);
    const results = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return getUploadModule().uploadService.uploadFile({
          fieldname: 'files',
          originalname: file.name,
          encoding: '7bit',
          mimetype: file.type,
          buffer,
          size: file.size
        }, options);
      })
    );

    const failed = results.filter((r) => !r.success);

    return NextResponse.json({
      success: failed.length === 0,
      data: results.filter((r) => r.success),
      errors: failed.flatMap((r) => r.errors)
    }, { status: failed.length === 0 ? 201 : 207 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
