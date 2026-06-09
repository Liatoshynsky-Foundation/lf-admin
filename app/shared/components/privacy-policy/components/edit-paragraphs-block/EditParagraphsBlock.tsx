import { JSONContent } from '@tiptap/react';

import { PAGE_IDS } from '~/constants/pageBlocks';
import { ensureIds } from '~/lib/utils/ensureIds';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import { EditBlockSkeleton } from '~/shared/components/edit-block-skeleton/EditBlockSkeleton';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';
import { BlocksMap } from '~/types/store/pages';

type BlockIdsWithDescription = {
  [K in keyof BlocksMap]: 'description' extends keyof BlocksMap[K] ? K : never;
}[keyof BlocksMap];


interface EditParagraphsBlockProps<T extends BlockIdsWithDescription> {
  blockId: T;
  title: string;
}


export const EditParagraphsBlock = <T extends BlockIdsWithDescription>({ blockId, title }: EditParagraphsBlockProps<T>) => {
  const pageId = PAGE_IDS.PRIVACY_POLICY;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((state) => state.locale);
  const setField = useStore((state) => state.setField);

  if (!block) return <EditBlockSkeleton />;
  if (!('description' in block)) return null;

  const onParagraphChange = (index: number, val: JSONContent) => {
    const oldBlockDescription = block.description;
    const currentContentArray = [...oldBlockDescription[currentLocale].content || []];
    currentContentArray[index] = val;

    const newDescription = {
      ...oldBlockDescription,
      [currentLocale]: {
        ...oldBlockDescription[currentLocale],
        content: currentContentArray
      }
    };

    setField(pageId, blockId, 'description', newDescription);
  };

  const paragraphs = ensureIds(block.description[currentLocale].content || []);
  if (!paragraphs || paragraphs.length === 0) return null;

  return (
    <CollapsibleBlock title={title}>
      {paragraphs.map((paragraphNode, i) =>
        (
          <CustomTextField
            fieldType="formatting"
            key={paragraphNode.id}
            title={`Текст ${i + 1} абзацу`}
            label="Текст"
            value={paragraphNode}
            onChange={(value) => onParagraphChange(i, value)}
          />
        )
      )}
    </CollapsibleBlock>
  );
};