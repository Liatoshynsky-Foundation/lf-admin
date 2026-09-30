import type { MediaModalResult } from './MediaModal.types';
import { AssetType } from '~/types/graphql/generated/graphql';

export type PdfAttachment = {
  filename: string;
  url: string;
  mimeType: string;
};

export type ResolvePdfAttachmentResult = {
  pdf: PdfAttachment;
  source: 'upload' | 'library';
};

type CreatePdfAsset = (options: {
  variables: {
    input: {
      filename: string;
      url: string;
      mimeType: string;
      sizeBytes: number;
      type: AssetType;
    };
  };
}) => Promise<{ data?: { createAsset?: PdfAttachment | null } | null }>;

export async function resolvePdfAttachmentFromMediaModal(
  result: MediaModalResult,
  createAsset: CreatePdfAsset,
  uploadFailedMessage: string
): Promise<ResolvePdfAttachmentResult | null> {
  if (result.selected.kind === 'upload' && result.uploadResult) {
    const { url, filename, originalName, mimeType, size } = result.uploadResult;

    const response = await createAsset({
      variables: {
        input: {
          filename: originalName || filename,
          url,
          mimeType,
          sizeBytes: size,
          type: AssetType.Pdf
        }
      }
    });

    const asset = response.data?.createAsset;
    if (!asset) {
      throw new Error(uploadFailedMessage);
    }

    return {
      pdf: {
        filename: asset.filename,
        url: asset.url,
        mimeType: asset.mimeType
      },
      source: 'upload'
    };
  }

  if (result.selected.kind === 'gallery' || result.selected.kind === 'used') {
    return {
      pdf: {
        filename: result.selected.fileName,
        url: result.selected.src,
        mimeType: 'application/pdf'
      },
      source: 'library'
    };
  }

  return null;
}
