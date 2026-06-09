import { fireEvent, render, screen } from '@testing-library/react';

import { mockAddPoint, mockRemovePoint, mockUpdatePoint, setFieldMock } from '../../__mocks__/setup-mocks';
import { BlockWithDescriptionListNote, EditDescriptionListNoteBlock } from './EditDescriptionListNoteBlock';
import { createDocNode } from '~/__mocks__/utils';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { emptyDoc, usePointsList } from '~/shared/hooks/use-points-list/usePointsList';



jest.mock('~/shared/components/design-system/collapsible-block/CollapsibleBlock');
jest.mock('~/shared/components/design-system/text-field/TextField');

jest.mock('~/shared/components/privacy-policy/components/points-list/PointsList');
jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: 'uk'; readonly setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));
jest.mock('~/shared/hooks/use-points-list/usePointsList', () => ({
  usePointsList: jest.fn()
}));

const mockBlock = {
  title: { uk: emptyDoc, en: emptyDoc },
  description: { uk: { type: 'doc', content: [{ text: 'Опис' }] }, en: emptyDoc },
  note: { uk: { type: 'doc', content: [{ text: 'Нотатка' }] }, en: emptyDoc },
  list: [{ id: '1', uk: { type: 'doc', content: [{ text: 'Пункт 1' }] }, en: emptyDoc }]
};

const defaultMockProps = {
  title: 'Заголовок блоку',
  blockId: 'Cookies' as BlockWithDescriptionListNote,
  listFieldName: 'list' as any,
  block: mockBlock
};

const mockPoints = [
  { id: '1', value: { type: 'doc', content: [{ text: 'Пункт 1' }] } }
];

const keys = {
  description: 'Вступний текст секції',
  note: 'Додаткова інформація'
};

const runSimulation = (testidToClick?: string) => {
  render(<EditDescriptionListNoteBlock
    {...defaultMockProps} />);
  if (testidToClick) {
    fireEvent.click(screen.getByTestId(testidToClick));
  }
};
describe('EditDescriptionListNoteBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePointsList as jest.Mock).mockReturnValue({
      addPoint: mockAddPoint,
      removePoint: mockRemovePoint,
      updatePoint: mockUpdatePoint,
      points: mockPoints
    });
  });

  it('should render all sections correctly when provided', () => {
    render(
      <EditDescriptionListNoteBlock
        {...defaultMockProps}
      />
    );

    expect(screen.getByText(defaultMockProps.title)).toBeInTheDocument();

    expect(screen.getByTestId('textfield-wrapper-Вступний текст секції')).toBeInTheDocument();
    expect(screen.getByTestId('textfield-wrapper-Додаткова інформація')).toBeInTheDocument();

    expect(screen.getByTestId('points-list')).toBeInTheDocument();
    expect(screen.getByTestId('points-count')).toHaveTextContent('1');
  });

  it.each([
    [
      'description changes',
      `trigger-change-${keys.description}`,
      'description',
      expect.objectContaining({ uk: createDocNode(`Updated ${keys.description}`) })
    ], [
      'note changes',
      `trigger-change-${keys.note}`,
      'note',
      expect.objectContaining({ uk: createDocNode(`Updated ${keys.note}`) })
    ],])(
    'should correctly invoke setField upon %s',
    (_scenario, triggerId, storeKey, expectedPayload) => {
      runSimulation(triggerId);

      expect(setFieldMock).toHaveBeenCalledWith(
        PAGE_IDS.PRIVACY_POLICY,
        BLOCK_IDS.COOKIES,
        storeKey,
        expectedPayload
      );
    }
  );
});
