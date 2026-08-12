import { DragEndEvent } from '@dnd-kit/core';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import WarInUkraineReorderingPage from './page';
import { PAGE_IDS } from '~/constants/pageBlocks';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { useStore } from '~/store';

jest.mock('~/store', () => ({
  useStore: jest.fn()
}));

jest.mock('~/lib/utils/sortableDragEndHelper', () => ({
  handleSortableDragEnd: jest.fn()
}));

jest.mock('~/shared/components/editable-page-layout/EditablePageLayout', () => ({
  EditablePageLayout: ({ children, headerTitle }: { children: React.ReactNode; headerTitle: string }) => (
    <div data-testid="editable-layout" data-title={headerTitle}>
      {children}
    </div>
  )
}));

jest.mock('~/shared/components/sortable-list/SortableList', () => ({
  SortableList: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (e: any) => void }) => (
    <div data-testid="sortable-list" onClick={() => onDragEnd({} as DragEndEvent)}>
      {children}
    </div>
  )
}));

jest.mock('~/shared/components/sortable-item-wrapper/SortableItemWrapper', () => ({
  SortableItemWrapper: ({ children, id }: { children: React.ReactNode; id: string }) => (
    <div data-testid={`sortable-item-${id}`}>{children}</div>
  )
}));

jest.mock('~/shared/components/war-in-ukraine/WarInfo/WarInfo', () => ({
  WarInfo: () => <div data-testid="war-info" />
}));
jest.mock('~/shared/components/war-in-ukraine/PrincipleOfHope/PrincipleOfHope', () => ({
  PrincipleOfHope: () => <div data-testid="principle-of-hope" />
}));
jest.mock('~/shared/components/war-in-ukraine/WarCarousel/WarCarousel', () => ({
  WarCarousel: () => <div data-testid="war-carousel" />
}));
jest.mock('~/shared/components/war-in-ukraine/YermolenkoLinks/YermolenkoLinks', () => ({
  YermolenkoLinks: () => <div data-testid="yermolenko-links" />
}));
jest.mock('~/shared/components/war-in-ukraine/VolunteerDonation/VolunteerDonation', () => ({
  VolunteerDonation: () => <div data-testid="volunteer-donation" />
}));

describe('WarInUkraineReorderingPage', () => {
  const mockSetBlocksOrder = jest.fn();
  const pageSlug = PAGE_IDS.WAR_IN_UKRAINE;

  beforeEach(() => {
    jest.clearAllMocks();

    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        blocksOrder: {},
        setBlocksOrder: mockSetBlocksOrder
      };
      return selector(state);
    });
  });

  it('renders layout with correct title', () => {
    render(<WarInUkraineReorderingPage />);

    const layout = screen.getByTestId('editable-layout');
    expect(layout).toBeInTheDocument();
    expect(layout).toHaveAttribute('data-title', 'Війна в Україні');
  });

  it('always renders the static WarInfo block outside of sortable list', () => {
    render(<WarInUkraineReorderingPage />);

    const warInfo = screen.getByTestId('war-info');
    const sortableList = screen.getByTestId('sortable-list');

    expect(warInfo).toBeInTheDocument();
    expect(sortableList).not.toContainElement(warInfo);
  });

  it('renders sortable blocks in default order if store has no custom order', () => {
    render(<WarInUkraineReorderingPage />);

    expect(screen.getByTestId('sortable-item-principle-of-hope')).toBeInTheDocument();
    expect(screen.getByTestId('sortable-item-war-carousel')).toBeInTheDocument();
    expect(screen.getByTestId('sortable-item-yermolenko-links')).toBeInTheDocument();
    expect(screen.getByTestId('sortable-item-volunteer-donation')).toBeInTheDocument();
  });

  it('renders sortable blocks based on store order', () => {
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        blocksOrder: {
          [pageSlug]: ['war-info', 'volunteer-donation', 'war-carousel']
        },
        setBlocksOrder: mockSetBlocksOrder
      };
      return selector(state);
    });

    render(<WarInUkraineReorderingPage />);

    expect(screen.getByTestId('sortable-item-volunteer-donation')).toBeInTheDocument();
    expect(screen.getByTestId('sortable-item-war-carousel')).toBeInTheDocument();
    expect(screen.queryByTestId('sortable-item-principle-of-hope')).not.toBeInTheDocument();
  });

  it('calls handleSortableDragEnd and setBlocksOrder correctly on drag end', () => {
    (handleSortableDragEnd as jest.Mock).mockImplementation((_event, _items, callback) => {
      callback(['yermolenko-links', 'war-carousel']);
    });

    render(<WarInUkraineReorderingPage />);

    const sortableList = screen.getByTestId('sortable-list');

    fireEvent.click(sortableList);

    expect(handleSortableDragEnd).toHaveBeenCalled();
    expect(mockSetBlocksOrder).toHaveBeenCalledWith(pageSlug, ['war-info', 'yermolenko-links', 'war-carousel']);
  });
});
