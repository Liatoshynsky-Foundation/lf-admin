import type { MediaModalResult } from './MediaModal.types';
import { resolvePdfAttachmentFromMediaModal } from './resolvePdfAttachmentFromMediaModal';
import { AssetType } from '~/types/graphql/generated/graphql';

const uploadFailedMessage = 'upload failed';

const createUploadResult = (overrides?: Partial<MediaModalResult>): MediaModalResult =>
  ({
    selected: { kind: 'upload', id: 'u1', fileName: 'file.pdf', file: new File([], 'file.pdf') },
    crop: null,
    uploadResult: {
      url: 'https://example.com/file.pdf',
      filename: 'stored.pdf',
      originalName: 'original.pdf',
      mimeType: 'application/pdf',
      size: 100
    },
    ...overrides
  }) as MediaModalResult;

describe('resolvePdfAttachmentFromMediaModal', () => {
  it('creates an asset from upload and returns pdf + upload source', async () => {
    const createAsset = jest.fn().mockResolvedValue({
      data: {
        createAsset: {
          filename: 'asset.pdf',
          url: 'https://cdn.example.com/asset.pdf',
          mimeType: 'application/pdf'
        }
      }
    });

    const resolved = await resolvePdfAttachmentFromMediaModal(
      createUploadResult(),
      createAsset,
      uploadFailedMessage
    );

    expect(createAsset).toHaveBeenCalledWith({
      variables: {
        input: {
          filename: 'original.pdf',
          url: 'https://example.com/file.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 100,
          type: AssetType.Pdf
        }
      }
    });
    expect(resolved).toEqual({
      pdf: {
        filename: 'asset.pdf',
        url: 'https://cdn.example.com/asset.pdf',
        mimeType: 'application/pdf'
      },
      source: 'upload'
    });
  });

  it('falls back to filename when originalName is empty', async () => {
    const createAsset = jest.fn().mockResolvedValue({
      data: {
        createAsset: {
          filename: 'stored.pdf',
          url: 'https://example.com/stored.pdf',
          mimeType: 'application/pdf'
        }
      }
    });

    await resolvePdfAttachmentFromMediaModal(
      createUploadResult({
        uploadResult: {
          url: 'https://example.com/stored.pdf',
          filename: 'stored.pdf',
          originalName: '',
          mimeType: 'application/pdf',
          size: 50
        }
      }),
      createAsset,
      uploadFailedMessage
    );

    expect(createAsset).toHaveBeenCalledWith({
      variables: {
        input: expect.objectContaining({ filename: 'stored.pdf' })
      }
    });
  });

  it('throws when createAsset returns no asset', async () => {
    const createAsset = jest.fn().mockResolvedValue({ data: { createAsset: null } });

    await expect(
      resolvePdfAttachmentFromMediaModal(createUploadResult(), createAsset, uploadFailedMessage)
    ).rejects.toThrow(uploadFailedMessage);
  });

  it('returns null when upload is selected but uploadResult is missing', async () => {
    const createAsset = jest.fn();
    const result = createUploadResult({ uploadResult: undefined });

    await expect(
      resolvePdfAttachmentFromMediaModal(result, createAsset, uploadFailedMessage)
    ).resolves.toBeNull();
    expect(createAsset).not.toHaveBeenCalled();
  });

  it.each([
    ['gallery', { kind: 'gallery' as const, id: 'g1', fileName: 'g.pdf', src: 'https://ex/g.pdf', locale: 'uk' as const }],
    ['used', { kind: 'used' as const, id: 'u1', fileName: 'u.pdf', src: 'https://ex/u.pdf', locale: 'uk' as const }]
  ])('maps %s selection without createAsset', async (_, selected) => {
    const createAsset = jest.fn();

    const resolved = await resolvePdfAttachmentFromMediaModal(
      { selected, crop: null },
      createAsset,
      uploadFailedMessage
    );

    expect(createAsset).not.toHaveBeenCalled();
    expect(resolved).toEqual({
      pdf: {
        filename: selected.fileName,
        url: selected.src,
        mimeType: 'application/pdf'
      },
      source: 'library'
    });
  });

  it('returns null for unrecognized selection kind', async () => {
    const createAsset = jest.fn();

    await expect(
      resolvePdfAttachmentFromMediaModal(
        { selected: { kind: 'unknown' } as never, crop: null },
        createAsset,
        uploadFailedMessage
      )
    ).resolves.toBeNull();
  });
});
