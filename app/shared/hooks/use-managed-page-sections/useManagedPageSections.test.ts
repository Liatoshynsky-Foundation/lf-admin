import { act, renderHook } from '@testing-library/react';

import { useManagedPageSections } from './useManagedPageSections';
import { createPageSection } from '~/shared/components/page-sections/pageSection.utils';
import { useStore } from '~/store';

const PAGE_SLUG = 'about-us';

describe('useManagedPageSections', () => {
  beforeEach(() => {
    useStore.setState({
      blocks: { [PAGE_SLUG]: { OurGoals: { title: { uk: {}, en: {} }, goals: [] } } },
      blocksOrder: { [PAGE_SLUG]: ['OurGoals'] },
      isChanged: false
    });
  });

  it('should persist a new section as a page block and append it to blocksOrder', () => {
    const { result } = renderHook(() => useManagedPageSections(PAGE_SLUG));

    act(() => {
      result.current.addSection();
    });

    const sectionId = result.current.sections[0]?.id;
    expect(sectionId).toBeDefined();
    expect(useStore.getState().blocks[PAGE_SLUG]?.[sectionId!]).toMatchObject({ kind: 'managedPageSection' });
    expect(useStore.getState().blocksOrder[PAGE_SLUG]).toEqual(['OurGoals', sectionId]);
    expect(useStore.getState().isChanged).toBe(true);
  });

  it('should remove managed section block on delete', () => {
    const { result } = renderHook(() => useManagedPageSections(PAGE_SLUG));
    const section = createPageSection();

    act(() => {
      result.current.reorderSections([section]);
    });

    act(() => {
      result.current.removeSection(section.id);
    });

    expect(useStore.getState().blocks[PAGE_SLUG]?.[section.id]).toBeUndefined();
    expect(useStore.getState().blocksOrder[PAGE_SLUG]).toEqual(['OurGoals']);
  });
});
