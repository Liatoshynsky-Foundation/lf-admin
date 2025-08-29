import { z } from 'zod';

import { zFolderNameSchema } from '~/validators/blob.schema';

export const zBlobQuerySchema = z.object({
  blobName: z.string().min(1),
  folderName: zFolderNameSchema
});
