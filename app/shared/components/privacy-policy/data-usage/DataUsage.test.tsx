import { fireEvent, render, screen } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { createDocNode } from '../../about-us/__mocks__/utils';
import { DataUsage } from './DataUsage';
import { usePointsList } from '~/shared/hooks/use-points-list/usePointsList';
import { DataUsageBlock } from '~/types/store/pages/privacy-policy';

const usePageBlockMock = jest.fn();
const setFieldMock = jest.fn();

const mockAddPoint = jest.fn();
const mockRemovePoint = jest.fn();
const mockUpdatePoint = jest.fn();


jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: () => usePageBlockMock()
}));
jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: 'uk'; readonly setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));
jest.mock('~/shared/hooks/use-points-list/usePointsList', () => ({
  usePointsList: jest.fn()
}));

jest.mock('../../edit-block-skeleton/EditBlockSkeleton', () => ({
  EditBlockSkeleton: () => <div data-testid="skeleton">Loading...</div>
}));


jest.mock('~/ds-components/collapsible-block/CollapsibleBlock');
jest.mock('~/ds-components/text-field/TextField');

interface MockPoinstsListProps<T> {
    points: T[],
    addPoint: () => T;
}
jest.mock('../components/points-list/PointsList', () => ({
  PointsList: <T extends { readonly id: string; readonly value: JSONContent }>({ addPoint, points}: MockPoinstsListProps<T>) => (
    <div data-testid="points-list">
      <button data-testid="trigger-add-point" onClick={addPoint}>Add</button>
      <span data-testid="points-count">{points.length}</span>
    </div>
  )
}));


const mockTitleJson = createDocNode('Initial title');
const mockDescriptionJson = createDocNode('Initial description');
const mockListPointJson = createDocNode('Initial the first list item');

const mockBlock: DataUsageBlock = {
  title: { uk: mockTitleJson, en: mockTitleJson },
  description: { uk: mockDescriptionJson, en: mockDescriptionJson },
  list: [{ uk: mockListPointJson, en: mockListPointJson }],
};

const keys = {
  title: 'Вступний текст секції',
  listItem: 'Текст пункту',
};

const runSimulation = (testidToClick?: string) => {
  render(<DataUsage />);

  if (testidToClick) {
    fireEvent.click(screen.getByTestId(testidToClick));
  }
};

beforeAll(() => {
  crypto.randomUUID = jest.fn(() => 'uuid-1') as typeof crypto.randomUUID;
});

describe('DataUsage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (usePointsList as jest.Mock).mockReturnValue({
      addPoint: mockAddPoint,
      removePoint: mockRemovePoint,
      updatePoint: mockUpdatePoint,
      points: []
    });
    usePageBlockMock.mockReturnValue({ block: mockBlock });
  });

  it('should render structural layout boundaries and confirm deep initial JSON content payloads inside the DOM', () => {
    (usePointsList as jest.Mock).mockReturnValue({
      addPoint: mockAddPoint,
      removePoint: mockRemovePoint,
      updatePoint: mockUpdatePoint,
      points: [{ id: '1', text: 'Текст пункту' }]
    });
    runSimulation();

    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId(`textfield-json-${keys.title}`)).toHaveTextContent(JSON.stringify(mockTitleJson));
    expect(screen.getByTestId('points-count')).toHaveTextContent('1');
  });
});



