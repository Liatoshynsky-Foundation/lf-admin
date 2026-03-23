import { NextRequest, NextResponse } from 'next/server';

import { getUploadModule, parseFormDataOptions } from '~/api/uploads/upload-handler';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const options = parseFormDataOptions(formData);

    const uploadedFile = {
      fieldname: 'file',
      originalname: file.name,
      encoding: '7bit',
      mimetype: file.type,
      buffer,
      size: file.size
    };

    const result = await getUploadModule().uploadService.uploadFile(uploadedFile, options);

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.errors }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
