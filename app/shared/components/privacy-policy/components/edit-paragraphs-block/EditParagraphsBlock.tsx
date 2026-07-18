import { JSONContent } from '@tiptap/react';
import { useRef } from 'react';

import { PAGE_IDS } from '~/constants/pageBlocks';
import { proseToHeaderText } from '~/lib/utils/prose';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { CustomTextField } from '~/shared/components/design-system/text-field/TextField';
import { EditBlockSkeleton } from '~/shared/components/edit-block-skeleton/EditBlockSkeleton';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';
import { ProseDoc } from '~/types/common';
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
  const toggleBlockVisibility = useStore((state) => state.toggleBlockVisibility);

  const paragraphs = block?.description[currentLocale].content || [];
  const stableIds = useRef<string[]>([]);

  if (stableIds.current.length === 0) {
    stableIds.current = paragraphs.map(() => crypto.randomUUID());
  }

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

  const blockTitle = 'title' in block ? (block as { title?: Record<'uk' | 'en', JSONContent> }).title : undefined;

  const onTitleChange = (value: JSONContent) => {
    const fallbackTitle: Record<'uk' | 'en', JSONContent> = { uk: {} as JSONContent, en: {} as JSONContent };
    const newTitle = {
      ...(blockTitle ?? fallbackTitle),
      [currentLocale]: value
    };

    setField(
      pageId,
      blockId,
      'title' as Extract<keyof BlocksMap[T], string>,
      newTitle as BlocksMap[T][Extract<keyof BlocksMap[T], string>]
    );
  };

  if (!paragraphs || paragraphs.length === 0) return null;

  const headerTitle = proseToHeaderText(blockTitle?.[currentLocale] as ProseDoc, title);

  return (
    <CollapsibleBlock
      title={headerTitle}
      grip
      hidden={(block as { hidden?: boolean }).hidden}
      onToggleVisibility={() => toggleBlockVisibility(pageId, blockId)}
    >
      {blockTitle && (
        <CustomTextField
          fieldType="formatting"
          title="Заголовок секції"
          label="Текст заголовку"
          value={blockTitle[currentLocale]}
          onChange={onTitleChange}
        />
      )}

      {paragraphs.map((paragraphNode, i) =>
        (
          <CustomTextField
            fieldType="formatting"
            key={stableIds.current[i]}
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
