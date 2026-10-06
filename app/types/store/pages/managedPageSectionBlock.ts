import type { SectionItem } from '~/shared/components/page-sections/pageSection.types';
import type { LocalizedJSON, WithHidden } from '~/types/common';

export const MANAGED_PAGE_SECTION_BLOCK_KIND = 'managedPageSection' as const;

export type ManagedPageSectionBlock = {
  kind: typeof MANAGED_PAGE_SECTION_BLOCK_KIND;
  title: LocalizedJSON;
  items: SectionItem[];
} & WithHidden;
