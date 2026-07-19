import { fireEvent, render, screen } from '@testing-library/react';

import { LiatoshynskyOffice } from './Liatoshynsky-office';
import { createDocNode } from '~/__mocks__/utils';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';

const setFieldMock = jest.fn();
const toggleBlockVisibilityMock = jest.fn();
const setFieldValidityMock = jest.fn();

jest.mock('~/store', () => ({
  useStore: (selector: (s: { locale: 'uk'; setField: typeof setFieldMock; toggleBlockVisibility: typeof toggleBlockVisibilityMock; setFieldValidity: typeof setFieldValidityMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock, toggleBlockVisibility: toggleBlockVisibilityMock, setFieldValidity: setFieldValidityMock })
}));

const usePageBlockMock = jest.fn();
jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: (...args: unknown[]) => usePageBlockMock(...args)
}));

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({
    title,
    children,
    onToggleVisibility
  }: {
    title: string;
    children: React.ReactNode;
    onToggleVisibility?: () => void;
  }) => (
    <div data-testid="collapsible-block">
      <div>{title}</div>
      {onToggleVisibility && (
        <button data-testid="collapsible-block-toggle-visibility" onClick={onToggleVisibility}>
          Toggle visibility
        </button>
      )}
      {children}
    </div>
  )
}));
jest.mock('../../edit-block-skeleton/EditBlockSkeleton', () => ({
  EditBlockSkeleton: () => <div data-testid="edit-block-skeleton" />
}));
jest.mock('~/components/grip/Grip');
jest.mock('~/ds-components/text-field/TextField');

jest.mock('./quote-block/QuoteBlock', () => ({
  QuoteBlock: ({
    title,
    description,
    onTitleChange,
    onDescriptionChange
  }: {
    title: string;
    description: string;
    onTitleChange: (val: string) => void;
    onDescriptionChange: (val: string) => void;
  }) => (
    <div data-testid="quote-block">
      <input value={title} data-testid="quote-title" onChange={(e) => onTitleChange(e.target.value)} />
      <textarea
        value={description}
        data-testid="quote-description"
        onChange={(e) => onDescriptionChange(e.target.value)}
      />
    </div>
  )
}));

describe('LiatoshynskyOffice', () => {
  const hardcodedData = {
    title: 'Кабінет Лятошинського',
    mainQuote: 'Це основна цитата',
    description: 'Це опис цитати'
  };

  const renderComponent = () => render(<LiatoshynskyOffice />);
  const getTitleInput = () => screen.getByTestId('quote-title') as HTMLInputElement;
  const getDescriptionInput = () => screen.getByTestId('quote-description') as HTMLTextAreaElement;

  beforeEach(() => {
    jest.clearAllMocks();

    usePageBlockMock.mockReturnValue({
      loading: false,
      error: undefined,
      block: {
        quote: {
          source: { uk: hardcodedData.mainQuote },
          text: { uk: hardcodedData.description }
        }
      }
    });
  });

  it('should render collapsible block with title', () => {
    renderComponent();
    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByText(hardcodedData.title)).toBeInTheDocument();
  });

  it('should render QuoteBlock with correct values', () => {
    renderComponent();
    expect(getTitleInput()).toHaveValue(hardcodedData.mainQuote);
    expect(getDescriptionInput()).toHaveValue(hardcodedData.description);
  });

  it('should render skeleton when block is missing', () => {
    usePageBlockMock.mockReturnValue({ loading: false, error: undefined, block: undefined });

    renderComponent();

    expect(screen.getByTestId('edit-block-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('collapsible-block')).not.toBeInTheDocument();
  });

  it('should update quote title', () => {
    renderComponent();
    fireEvent.change(getTitleInput(), { target: { value: 'Нова цитата' } });
    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.LIATOSHYNSKY_OFFICE,
      'quote',
      expect.objectContaining({
        source: expect.objectContaining({ uk: 'Нова цитата' }),
        text: expect.any(Object)
      })
    );
  });

  it('should update quote description', () => {
    renderComponent();
    fireEvent.change(getDescriptionInput(), { target: { value: 'Новий опис' } });
    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.LIATOSHYNSKY_OFFICE,
      'quote',
      expect.objectContaining({
        source: expect.any(Object),
        text: expect.objectContaining({ uk: 'Новий опис' })
      })
    );
  });

  it('should call toggleBlockVisibility with pageId and blockId when the visibility toggle is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('collapsible-block-toggle-visibility'));

    expect(toggleBlockVisibilityMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.LIATOSHYNSKY_OFFICE);
  });

  it('should update the section title, falling back to an empty localized doc when block.title is missing', () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('trigger-change-Заголовок секції'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.LIATOSHYNSKY_OFFICE,
      'title',
      expect.objectContaining({
        uk: createDocNode('Updated Заголовок секції'),
        en: {}
      })
    );
  });

  it('should mark the title as invalid after blur when it is empty, and clear the flag on unmount', () => {
    const { unmount } = renderComponent();

    fireEvent.click(screen.getByTestId('trigger-blur-Заголовок секції'));

    expect(screen.getByTestId('textfield-error-Заголовок секції')).toBeInTheDocument();
    expect(setFieldValidityMock).toHaveBeenCalledWith(
      `${PAGE_IDS.ABOUT_US}:${BLOCK_IDS.LIATOSHYNSKY_OFFICE}:title`,
      true
    );

    unmount();

    expect(setFieldValidityMock).toHaveBeenLastCalledWith(
      `${PAGE_IDS.ABOUT_US}:${BLOCK_IDS.LIATOSHYNSKY_OFFICE}:title`,
      false
    );
  });
});
