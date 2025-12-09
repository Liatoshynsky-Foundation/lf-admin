import { NextRequest, NextResponse } from 'next/server';

import { config as appConfig } from '~/back-config';
import { initializeUploadModule } from '~/uploads/initialize';

const uploadModule = initializeUploadModule(appConfig);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files uploaded' }, { status: 400 });
    }

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

    const results = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadedFile = {
          fieldname: 'files',
          originalname: file.name,
          encoding: '7bit',
          mimetype: file.type,
          buffer,
          size: file.size
        };

        return uploadModule.uploadService.uploadFile(uploadedFile, options);
      })
    );

    const successfulUploads = results.filter((r) => r.success);
    const failedUploads = results.filter((r) => !r.success);

    return NextResponse.json(
      {
        success: failedUploads.length === 0,
        data: successfulUploads.map((r) => ({
          filename: r.filename,
          originalName: r.originalName,
          url: r.url,
          size: r.size,
          mimeType: r.mimeType,
          metadata: r.metadata
        })),
        errors: failedUploads.map((r) => r.errors).flat()
      },
      { status: failedUploads.length === 0 ? 201 : 207 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
