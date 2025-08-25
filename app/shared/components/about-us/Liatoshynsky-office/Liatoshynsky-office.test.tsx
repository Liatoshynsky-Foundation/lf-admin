import { fireEvent, render, screen } from '@testing-library/react';

import { LiatoshynskyOffice } from './Liatoshynsky-office';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';

const setFieldMock = jest.fn();

// 🔹 Мок стора
jest.mock('~/store', () => ({
  useStore: (selector: (s: { locale: 'uk'; setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));

// 🔹 Мок usePageBlocks
const usePageBlocksMock = jest.fn();
jest.mock('~/shared/hooks/use-page-blocks/usePageBlocks', () => ({
  usePageBlocks: (...args: unknown[]) => usePageBlocksMock(...args)
}));

// 🔹 Мок CollapsibleBlock
jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="collapsible-block">
      <div>{title}</div>
      {children}
    </div>
  )
}));

// 🔹 Мок QuoteBlock
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

  beforeEach(() => {
    jest.clearAllMocks();

    usePageBlocksMock.mockReturnValue({
      blocks: {
        LiatoshynskyOffice: {
          quote: {
            source: { uk: hardcodedData.mainQuote },
            text: { uk: hardcodedData.description }
          }
        }
      }
    });
  });

  it('renders collapsible block with title', () => {
    render(<LiatoshynskyOffice />);
    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByText(hardcodedData.title)).toBeInTheDocument();
  });

  it('renders QuoteBlock with correct values', () => {
    render(<LiatoshynskyOffice />);
    expect(screen.getByTestId('quote-title')).toHaveValue(hardcodedData.mainQuote);
    expect(screen.getByTestId('quote-description')).toHaveValue(hardcodedData.description);
  });

  it('updates quote title', () => {
    render(<LiatoshynskyOffice />);
    const titleInput = screen.getByTestId('quote-title');
    fireEvent.change(titleInput, { target: { value: 'Нова цитата' } });
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

  it('updates quote description', () => {
    render(<LiatoshynskyOffice />);
    const descInput = screen.getByTestId('quote-description');
    fireEvent.change(descInput, { target: { value: 'Новий опис' } });
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
});
