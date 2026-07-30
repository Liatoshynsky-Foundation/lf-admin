import { useCallback, useEffect, useMemo, useState } from 'react';

import { FILES_UNKNOWN_SECTION_LABEL } from '~/constants/files';
import type { FileUsageLink } from '~/shared/components/file-info-sidebar/FileInfoSidebar';
import type { FilesCardsLayoutItem } from '~/shared/components/files-cards-layout';
import type { GalleryFile } from '~/shared/hooks/use-galllery-photo/useGallery';
import { type AllAssetsQuery, AssetType, type CreateAssetInput } from '~/types/graphql/generated/graphql';

type AssetItem = AllAssetsQuery['allAssets'][number];

export type FilesPageFileItem = FilesCardsLayoutItem & {
  description?: string;
  format?: string;
  createdAtRaw?: string;
  size?: string;
  sizeBytes: number;
  mimeType: string;
  originalname?: string;
  filename: string;
  previewUrl?: string;
  downloadUrl?: string;
  addedBy?: { name: string; avatarUrl?: string };
  usage: FileUsageLink[];
  assetType: AssetType;
  isOrphan: boolean;
};

const assetCardTypeMap: Record<AssetType, FilesCardsLayoutItem['type']> = {
  [AssetType.Image]: 'image',
  [AssetType.Pdf]: 'pdf',
  [AssetType.Audio]: 'audio',
  [AssetType.Document]: 'document',
  [AssetType.Spreadsheet]: 'spreadsheet',
  [AssetType.Video]: 'video',
  [AssetType.Archive]: 'archive'
};

const formatDateAdded = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('uk-UA');
};

const formatFileSize = (sizeBytes: number) => {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  const sizeKb = sizeBytes / 1024;
  if (sizeKb < 1024) {
    return `${sizeKb.toFixed(1)} KB`;
  }

  const sizeMb = sizeKb / 1024;
  return `${sizeMb.toFixed(1)} MB`;
};

const formatFromMimeType = (mimeType: string, filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (ext) {
    if (ext === 'jpeg') return 'jpg';
    return ext;
  }

  const byMime = mimeType.split('/')[1]?.toLowerCase();
  if (!byMime) return undefined;

  if (byMime.includes('spreadsheetml')) return 'xlsx';
  if (byMime.includes('wordprocessingml')) return 'docx';
  if (byMime.includes('zip')) return 'zip';
  if (byMime.includes('rar')) return 'rar';
  if (byMime.includes('svg')) return 'svg';
  if (byMime === 'jpeg') return 'jpg';
  if (byMime === 'wave' || byMime === 'x-wav') return 'wav';

  return byMime;
};

const usageToLink = (pageId?: string | null) => {
  if (!pageId) {
    return undefined;
  }

  return pageId.startsWith('/') ? pageId : `/${pageId}`;
};

const getAssetTypeFromFile = (mimeType: string, filename: string): AssetType => {
  const type = mimeType.toLowerCase();
  const name = filename.toLowerCase();

  if (type.startsWith('image/') || /\.(avif|gif|jpe?g|png|svg|webp)$/.test(name)) return AssetType.Image;
  if (type.startsWith('audio/') || /\.(aac|flac|m4a|mp3|ogg|wav)$/.test(name)) return AssetType.Audio;
  if (type.includes('pdf') || name.endsWith('.pdf')) return AssetType.Pdf;
  if (type.includes('spreadsheet') || type.includes('excel') || /\.(csv|xls|xlsx)$/.test(name)) return AssetType.Spreadsheet;
  if (type.startsWith('video/') || /\.(mov|mp4|webm)$/.test(name)) return AssetType.Video;
  if (type.includes('zip') || type.includes('rar') || /\.(7z|rar|zip)$/.test(name)) return AssetType.Archive;

  return AssetType.Document;
};

const toFileItemFromAsset = (asset: AssetItem): FilesPageFileItem => ({
  id: asset.id,
  type: assetCardTypeMap[asset.type],
  name: asset.filename,
  dateAdded: formatDateAdded(asset.createdAt),
  createdAtRaw: asset.createdAt,
  isStarred: asset.isStarred,
  usageLinks: asset.usageRefs.length,
  downloadUrl: asset.url,
  imageSrc: asset.type === AssetType.Image ? asset.url : undefined,
  previewUrl: asset.type === AssetType.Image ? asset.url : undefined,
  format: formatFromMimeType(asset.mimeType, asset.filename),
  size: formatFileSize(asset.sizeBytes),
  sizeBytes: asset.sizeBytes,
  mimeType: asset.mimeType,
  filename: asset.filename,
  originalname: asset.originalname ?? undefined,
  addedBy: asset.createdBy ? { name: asset.createdBy } : undefined,
  usage: asset.usageRefs.map((usageRef, index) => ({
    id: `${asset.id}-${index}`,
    label: usageRef.pageId ?? FILES_UNKNOWN_SECTION_LABEL,
    href: usageToLink(usageRef.pageId)
  })),
  description: asset.description ?? undefined,
  assetType: asset.type,
  isOrphan: false
});

const toFileItemFromR2 = (file: GalleryFile & { url: string }): FilesPageFileItem => {
  const assetType = getAssetTypeFromFile(file.mimeType, file.filename);

  return {
    id: file.url,
    type: assetCardTypeMap[assetType],
    name: file.originalName || file.filename,
    dateAdded: formatDateAdded(file.createdAt),
    createdAtRaw: file.createdAt,
    isStarred: false,
    usageLinks: 0,
    downloadUrl: file.url,
    imageSrc: assetType === AssetType.Image ? file.url : undefined,
    previewUrl: assetType === AssetType.Image ? file.url : undefined,
    format: formatFromMimeType(file.mimeType, file.filename),
    size: formatFileSize(file.size),
    sizeBytes: file.size,
    mimeType: file.mimeType,
    filename: file.filename,
    originalname: file.originalName,
    usage: [],
    description: undefined,
    assetType,
    isOrphan: true
  };
};

export const toCreateAssetInput = (file: FilesPageFileItem): CreateAssetInput => ({
  filename: file.filename,
  originalname: file.originalname ?? file.name,
  url: file.downloadUrl ?? file.id,
  mimeType: file.mimeType,
  sizeBytes: file.sizeBytes,
  type: file.assetType
});

export function useR2Files() {
  const [files, setFiles] = useState<GalleryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const removeFileByUrl = useCallback((url: string) => {
    setFiles((currentFiles) => currentFiles.filter((file) => file.url !== url));
  }, []);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError(null);

    fetch('/api/uploads')
      .then((response) => response.json())
      .then((data) => {
        if (!isMounted) return;

        if (!data.success) {
          throw new Error(data.error ?? 'Failed to fetch R2 files');
        }

        const mapped: GalleryFile[] = data.data.map(
          (file: { uploadedAt: string | Date } & Omit<GalleryFile, 'createdAt'>) => ({
            ...file,
            createdAt: file.uploadedAt instanceof Date ? file.uploadedAt.toISOString() : String(file.uploadedAt)
          })
        );

        setFiles(mapped);
      })
      .catch((fetchError: unknown) => {
        if (!isMounted) return;
        setError(fetchError instanceof Error ? fetchError : new Error('Failed to fetch R2 files'));
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { files, loading, error, removeFileByUrl };
}

export function useHybridFiles(assets: AssetItem[] = [], r2Files: GalleryFile[] = []): FilesPageFileItem[] {
  return useMemo(() => {
    const assetsByUrl = new Map<string, FilesPageFileItem>();

    assets.forEach((asset) => {
      assetsByUrl.set(asset.url, toFileItemFromAsset(asset));
    });

    r2Files
      .filter((file): file is GalleryFile & { url: string } => Boolean(file.url))
      .forEach((file) => {
        if (!assetsByUrl.has(file.url)) {
          assetsByUrl.set(file.url, toFileItemFromR2(file));
        }
      });

    return Array.from(assetsByUrl.values());
  }, [assets, r2Files]);
}
