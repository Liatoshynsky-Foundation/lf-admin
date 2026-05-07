import { getDefaultReactSlashMenuItems } from '@blocknote/react';
import { ImageIcon } from 'lucide-react';

import { StrictBlockNoteEditor } from '~/shared/components/content-editor/types';
import { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';

export const getCustomSlashMenuItems = (
  editor: StrictBlockNoteEditor,
  query: string,
  openMediaModal: () => Promise<MediaModalResult | null>
) => {
  const defaultItems = getDefaultReactSlashMenuItems(editor);

  const customImageItem = {
    title: 'Picture',
    aliases: ['image', 'img', 'picture', 'photo', 'фото', 'зображення'],
    group: 'Media',
    icon: <ImageIcon size={18} />,
    subtext: 'Pick photo',
    onItemClick: async () => {
      const result = await openMediaModal();
      if (result) {
        const { selected, uploadResult, crop } = result;
        const actualUrlString = uploadResult?.url ?? (selected.kind === 'upload' ? null : selected.src);

        if (actualUrlString) {
          const currentBlock = editor.getTextCursorPosition().block;
          editor.insertBlocks(
            [
              {
                type: 'image',
                props: {
                  url: actualUrlString,
                  cropData: JSON.stringify(crop || {}),
                  fileName: selected.fileName || 'image'
                }
              }
            ],
            currentBlock,
            'after'
          );
        }
      }
    }
  };

  const filteredItems = defaultItems.filter((item) => item.group !== 'Media');

  filteredItems.push(customImageItem);

  const queryLower = query.toLowerCase();
  return filteredItems.filter(
    (item) =>
      item.title.toLowerCase().includes(queryLower) ||
      item.aliases?.some((alias: string) => alias.toLowerCase().includes(queryLower))
  );
};
