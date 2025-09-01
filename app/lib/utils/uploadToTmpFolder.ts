import { useStore } from '~/store';
import { UploadBlobMutationFn } from '~/types/graphql/generated/graphql';
import { BlocksMap } from '~/types/store/pages';

export const handleUploadImage = async <K extends keyof BlocksMap, F extends keyof BlocksMap[K]>(
  file: File,
  pageId: string,
  blockId: K,
  folderName = 'tmp',
  key: F,
  uploadBlob: UploadBlobMutationFn
) => {
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
    useStore.getState().setField(pageId, blockId, key, {
      src: blobName ?? '',
      alt: { uk: '', en: '' },
      caption: { uk: '', en: '' },
      isTmp: true
    } as BlocksMap[K][F]);
    return blobName;
  }
};
