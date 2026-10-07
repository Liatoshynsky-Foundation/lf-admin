'use client';

import { DragEndEvent } from '@dnd-kit/core';
import { Box } from '@mui/material';
import { Plus } from 'lucide-react';

import { PageSectionCard } from './PageSectionCard';
import { styles } from './PageSectionsEditor.styles';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import Button from '~/shared/components/design-system/button/Button';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { useManagedPageSections } from '~/shared/hooks/use-managed-page-sections/useManagedPageSections';
import { useStore } from '~/store';

export interface PageSectionsEditorProps {
  pageSlug: string;
}

export const PageSectionsEditor = ({ pageSlug }: PageSectionsEditorProps) => {
  const locale = useStore((state) => state.locale);
  const { sections, addSection, updateSection, removeSection, reorderSections } = useManagedPageSections(pageSlug);

  const handleDragEnd = (event: DragEndEvent) => {
    handleSortableDragEnd(event, sections, reorderSections);
  };

  return (
    <Box sx={styles.root}>
      {sections.length > 0 && (
        <SortableList id="admin-page-sections" items={sections.map((section) => section.id)} onDragEnd={handleDragEnd}>
          {sections.map((section, index) => (
            <Box key={section.id} sx={styles.sectionSlot}>
              <SortableItemWrapper id={section.id}>
                <PageSectionCard
                  section={section}
                  index={index}
                  locale={locale}
                  onChange={updateSection}
                  onDelete={() => removeSection(section.id)}
                />
              </SortableItemWrapper>
            </Box>
          ))}
        </SortableList>
      )}

      <Box sx={styles.addSectionRow}>
        <Button variant="filled" color="primary" startIcon={<Plus size={16} />} onClick={addSection}>
          Додати секцію
        </Button>
      </Box>
    </Box>
  );
};
