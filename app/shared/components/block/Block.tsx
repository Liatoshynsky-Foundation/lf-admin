'use client';

import { DragEndEvent } from '@dnd-kit/core';
import { Box } from '@mui/material';

import { CONTENT_TYPE_REGISTRY } from './content-types/registry';
import Button from '~/ds-components/button/Button';
import CollapsibleBlock from '~/ds-components/collapsible-block/CollapsibleBlock';
import { proseToHeaderText } from '~/lib/utils/prose';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import PlusIcon from '~/public/icons/plus.svg';
import { styles } from '~/shared/components/block/Block.styles';
import { EditBlockSkeleton } from '~/shared/components/edit-block-skeleton/EditBlockSkeleton';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { BlockContentAdapter, useBlockContent } from '~/shared/hooks/use-block-content/useBlockContent';
import { useStore } from '~/store';
import type { BlockConfig } from '~/types/blocks/blockConfig';
import { CONTENT_TYPE, type ContentItem, type HeaderContentItem } from '~/types/blocks/contentTypes';
import type { ProseDoc } from '~/types/common';

interface BlockProps<TBlock = Record<string, unknown>> {
  pageId: string;
  blockId: string;
  config: BlockConfig;
  title: string;
  adapter?: BlockContentAdapter<TBlock>;
}

export function Block<TBlock = Record<string, unknown>>({
  pageId,
  blockId,
  config,
  title,
  adapter
}: BlockProps<TBlock>) {
  const locale = useStore((state) => state.locale);

  const { isLoaded, content, hidden, updateItem, addItem, removeItem, reorderItems, toggleVisibility } =
    useBlockContent<TBlock>(pageId, blockId, adapter);

  if (!isLoaded) return <EditBlockSkeleton />;

  const handleDragEnd = (event: DragEndEvent) => {
    handleSortableDragEnd(event, content, reorderItems);
  };

  const headerItem = content.find((item): item is HeaderContentItem => item.type === CONTENT_TYPE.HEADER);
  const headerTitle = proseToHeaderText(headerItem?.title?.[locale] as ProseDoc, title);

  // Какие типы можно добавлять: слоты, помеченные repeatable
  const addableSlots = config.allowed.filter((slot) => slot.repeatable);

  // Итем можно удалить, если его слот не required
  const isRemovable = (item: ContentItem) => {
    const slot = config.allowed.find((s) => s.type === item.type);
    return !slot?.required;
  };

  return (
    <CollapsibleBlock title={headerTitle} grip hidden={hidden} onToggleVisibility={toggleVisibility}>
      {content.length > 0 && (
        <SortableList id={`${pageId}:${blockId}`} items={content.map((item) => item.id)} onDragEnd={handleDragEnd}>
          {content.map((item) => {
            const Renderer = CONTENT_TYPE_REGISTRY[item.type];
            if (!Renderer) return null;

            return (
              <SortableItemWrapper id={item.id} key={item.id} gripHandle>
                <Box sx={styles.itemWrapper}>
                  <Renderer
                    item={item}
                    locale={locale}
                    pageId={pageId}
                    blockId={blockId}
                    onChange={(next) => updateItem(item.id, next)}
                  />
                  {isRemovable(item) && (
                    <Button variant="text" color="secondary" onClick={() => removeItem(item.id)}>
                      Видалити
                    </Button>
                  )}
                </Box>
              </SortableItemWrapper>
            );
          })}
        </SortableList>
      )}

      {addableSlots.length > 0 && (
        <Box sx={styles.addBar}>
          {addableSlots.map((slot) => (
            <Button
              key={slot.type}
              startIcon={<PlusIcon />}
              variant="outlined"
              color="primary"
              onClick={() => addItem(slot.type)}
            >
              {slot.label ?? `Додати ${slot.type}`}
            </Button>
          ))}
        </Box>
      )}
    </CollapsibleBlock>
  );
}

export default Block;
