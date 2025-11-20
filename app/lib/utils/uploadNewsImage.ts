import { UploadBlobMutationFn } from '~/types/graphql/generated/graphql';

export type NewsImageBlock = {
  src: string;
  alt: { uk: string; en: string };
  caption: { uk: string; en: string };
  isTmp?: boolean;
};

export const uploadNewsImage = async (
  file: File,
  uploadBlob: UploadBlobMutationFn,
  folderName: string = 'tmp'
): Promise<NewsImageBlock | undefined> => {
  try {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const res = await uploadBlob({
      variables: {
        folderName,
        blobName: file.name,
        buffer: base64,
        contentType: file.type
      }
    });

    if (res.data?.uploadBlob.success) {
      const blobName = res.data.uploadBlob.blobName;
      return {
        src: blobName ?? '',
        alt: { uk: '', en: '' },
        caption: { uk: '', en: '' },
        isTmp: folderName === 'tmp'
      };
    }
  } catch (error) {
    console.error('Failed to upload news image:', error);
  }

  return undefined;
};

export const getNewsCoverImageUrl = (coverImage: NewsImageBlock): string => {
  const folder = coverImage.isTmp ? 'tmp' : 'images/news';
  return `/api/blob-url?folderName=${folder}&blobName=${coverImage.src}`;
};
