import { useCallback, useMemo } from 'react';

import { ensureIds } from '~/lib/utils/ensureIds';
import { useStore } from '~/store';
import { CONTENT_TYPE, type ContentItem, type ContentTypeId } from '~/types/blocks/contentTypes';
import type { LocalizedJSON, WithHidden } from '~/types/common';
import type { BlocksMap } from '~/types/store/pages';

interface UseBlockContentResult {
  block: ContentBlockShape | undefined;
  isLoaded: boolean;
  content: ContentItem[];
  hidden?: boolean;
  updateItem: (id: string, next: ContentItem) => void;
  addItem: (type: ContentTypeId) => void;
  removeItem: (id: string) => void;
  reorderItems: (reordered: ContentItem[]) => void;
  toggleVisibility: () => void;
}

export interface BlockContentAdapter<TBlock = Record<string, unknown>> {
  toContent: (block: TBlock) => ContentItem[];
  fromContent: (content: ContentItem[], block: TBlock) => Partial<TBlock>;
}

type ContentBlockShape = Partial<WithHidden> & { content?: ContentItem[] };

const emptyLocalizedJSON = (): LocalizedJSON => ({
  uk: { type: 'doc', content: [] },
  en: { type: 'doc', content: [] }
});

const createEmptyContentItem = (type: ContentTypeId): ContentItem => {
  const id = crypto.randomUUID();

  switch (type) {
  case CONTENT_TYPE.HEADER:
    return { id, type, title: emptyLocalizedJSON(), helper: emptyLocalizedJSON() };
  case CONTENT_TYPE.PARAGRAPH:
    return { id, type, value: emptyLocalizedJSON() };
  case CONTENT_TYPE.LIST:
    return { id, type, items: [{ id: crypto.randomUUID(), ...emptyLocalizedJSON() }] };
  case CONTENT_TYPE.SECTION_LIST:
    return {
      id,
      type,
      items: [
        {
          id: crypto.randomUUID(),
          title: emptyLocalizedJSON(),
          description: emptyLocalizedJSON()
        }
      ]
    };
  case CONTENT_TYPE.QUOTE:
    return { id, type, source: emptyLocalizedJSON(), text: emptyLocalizedJSON() };
  case CONTENT_TYPE.IMAGE:
    return {
      id,
      type,
      value: {
        src: '',
        alt: emptyLocalizedJSON(),
        caption: emptyLocalizedJSON(),
        generatedSrc: ''
      }
    };
  }
};

export const useBlockContent = <TBlock = Record<string, unknown>>(
  pageId: string,
  blockId: string,
  adapter?: BlockContentAdapter<TBlock>
): UseBlockContentResult => {
  const block = useStore((state) => state.blocks?.[pageId]?.[blockId as keyof BlocksMap]) as
    | (ContentBlockShape & Record<string, unknown>)
    | undefined;

  const setField = useStore((state) => state.setField) as (p: string, b: string, f: string, v: unknown) => void;
  const setFields = useStore((state) => state.setFields) as (
    p: string,
    b: string,
    data: Record<string, unknown>
  ) => void;
  const toggleBlockVisibility = useStore((state) => state.toggleBlockVisibility) as (
    pageId: string,
    blockId: string
  ) => void;

  const content = useMemo<ContentItem[]>(() => {
    if (adapter && block) return ensureIds(adapter.toContent(block as TBlock)) as ContentItem[];
    return ensureIds(block?.content ?? []) as ContentItem[];
  }, [adapter, block]);
  const writeContent = useCallback(
    (next: ContentItem[]) => {
      if (adapter && block) {
        setFields(pageId, blockId, adapter.fromContent(next, block as TBlock));
      } else {
        setField(pageId, blockId, 'content', next);
      }
    },
    [adapter, block, setField, setFields, pageId, blockId]
  );

  const updateItem = useCallback(
    (id: string, next: ContentItem) => writeContent(content.map((item) => (item.id === id ? next : item))),
    [content, writeContent]
  );

  const addItem = useCallback(
    (type: ContentTypeId) => writeContent([...content, createEmptyContentItem(type)]),
    [content, writeContent]
  );

  const removeItem = useCallback(
    (id: string) => writeContent(content.filter((item) => item.id !== id)),
    [content, writeContent]
  );

  const reorderItems = useCallback((reordered: ContentItem[]) => writeContent(reordered), [writeContent]);

  const toggleVisibility = useCallback(
    () => toggleBlockVisibility(pageId, blockId),
    [toggleBlockVisibility, pageId, blockId]
  );

  return {
    block,
    isLoaded: block !== undefined,
    content,
    hidden: block?.hidden,
    updateItem,
    addItem,
    removeItem,
    reorderItems,
    toggleVisibility
  };
};
