import { NextRequest, NextResponse } from 'next/server';

import { config as appConfig } from '~/back-config';
import { initializeUploadModule } from '~/uploads/initialize';

const uploadModule = initializeUploadModule(appConfig);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const options: any = {};
    const fileType = formData.get('fileType');
    const validationRules = formData.get('validationRules');
    const processingOptions = formData.get('processingOptions');
    const metadata = formData.get('metadata');

    if (fileType) options.fileType = fileType;
    if (validationRules) {
      try {
        options.validationRules = JSON.parse(validationRules as string);
      } catch (e) {
        console.log(e);
      }
    }
    if (processingOptions) {
      try {
        options.processingOptions = JSON.parse(processingOptions as string);
      } catch (e) {
        console.log(e);
      }
    }
    if (metadata) {
      try {
        options.metadata = JSON.parse(metadata as string);
      } catch (e) {
        console.log(e);
      }
    }

    const uploadedFile = {
      fieldname: 'file',
      originalname: file.name,
      encoding: '7bit',
      mimetype: file.type,
      buffer,
      size: file.size
    };

    const result = await uploadModule.uploadService.uploadFile(uploadedFile, options);

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.errors }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          filename: result.filename,
          originalName: result.originalName,
          url: result.url,
          size: result.size,
          mimeType: result.mimeType,
          metadata: result.metadata
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};
