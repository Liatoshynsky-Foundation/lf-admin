import { useBlockNoteEditor, useComponentsContext, useSelectedBlocks } from '@blocknote/react';
import { Replace } from 'lucide-react';

import { MediaModalResult } from '../../media-modal/MediaModal.types';
import { customSchema } from '../BlockNoteEditor';

export const CustomReplaceButton = ({
  openMediaModal
}: {
    openMediaModal: () => Promise<MediaModalResult | null>;
  }) => {
  const editor = useBlockNoteEditor<typeof customSchema.blockSchema>();
  const Components = useComponentsContext()!;
  const selectedBlocks = useSelectedBlocks(editor);

  const block = selectedBlocks.length === 1 ? selectedBlocks[0] : undefined;

  if (block === undefined || (block.type !== 'image')) {
    return null;
  }

  return (
    <Components.FormattingToolbar.Button
      label="Replace image"
      mainTooltip="Replace image"
      icon={<Replace size={18} />}
      onClick={async () => {
        const result = await openMediaModal();

        if (result) {
          const { selected, uploadResult, crop } = result;

          const actualUrlString = uploadResult?.url ?? (selected.kind === 'upload' ? null : selected.src);

          if (actualUrlString) {
            editor.updateBlock(block.id, {
              type: 'image',
              props: {
                url: actualUrlString,
                cropData: JSON.stringify(crop || {}),
                fileName: selected.fileName || 'image'
              }
            });
          }
        }
      }}
    />
  );
};
