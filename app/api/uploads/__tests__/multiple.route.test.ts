/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { POST } from '../multiple/route';
import { getUploadModule } from '../upload-handler';

jest.mock('../upload-handler');

describe('POST /api/uploads/multiple', () => {
  const mockUploadFile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getUploadModule as jest.Mock).mockReturnValue({
      uploadService: { uploadFile: mockUploadFile }
    });
  });

  it('should return 201 when all files are uploaded successfully', async () => {
    const formData = new FormData();
    formData.append('files', new File(['1'], '1.jpg'));
    formData.append('files', new File(['2'], '2.jpg'));

    mockUploadFile.mockResolvedValue({ success: true, filename: 'saved.jpg' });

    const req = new NextRequest('https://localhost/api/uploads/multiple', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(mockUploadFile).toHaveBeenCalledTimes(2);
  });

  it('should return 207 if some uploads fail', async () => {
    const formData = new FormData();
    formData.append('files', new File(['1'], '1.jpg'));

    mockUploadFile.mockResolvedValue({ success: false, errors: ['Storage error'] });

    const req = new NextRequest('https://localhost/api/uploads/multiple', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req);
    expect(res.status).toBe(207);
  });
});