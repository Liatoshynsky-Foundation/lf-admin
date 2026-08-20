import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { TitleWithQuote } from './TitleWithQuote';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

jest.mock('~/store');

jest.mock('~/shared/hooks/use-page-block/usePageBlock');

jest.mock('~/shared/components/edit-block-skeleton/EditBlockSkeleton', () => ({
  EditBlockSkeleton: () => <div data-testid="skeleton">Skeleton</div>
}));

jest.mock('~/shared/components/design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="collapsible-block">{children}</div>
}));

jest.mock('~/ds-components/text-field/TextField', () => ({
  CustomTextField: ({ value, onChange, title }: any) => (
    <div data-testid="custom-text-field">
      <span>{title}</span>
      <input data-testid="title-input" value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}));

jest.mock('~/shared/components/about-us/liatoshynsky-office/quote-block/QuoteBlock', () => ({
  QuoteBlock: ({ title, description, onTitleChange, onDescriptionChange }: any) => (
    <div data-testid="quote-block">
      <input data-testid="source-input" value={title || ''} onChange={(e) => onTitleChange(e.target.value)} />
      <input
        data-testid="quote-input"
        value={description || ''}
        onChange={(e) => onDescriptionChange(e.target.value)}
      />
    </div>
  )
}));

describe('TitleWithQuote Component', () => {
  const mockUsePageBlock = usePageBlock as jest.Mock;
  const mockUseStore = useStore as unknown as jest.Mock;
  const mockSetField = jest.fn();

  const mockBlockData = {
    title: { uk: 'Початковий заголовок', en: 'Initial Title' },
    sourceText: { uk: 'Початкове джерело', en: 'Initial Source' },
    quoteText: { uk: 'Початкова цитата', en: 'Initial Quote' }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseStore.mockImplementation((selector: any) => {
      return selector({
        locale: 'uk',
        setField: mockSetField
      });
    });
  });

  it('should render EditBlockSkeleton when block is undefined', () => {
    mockUsePageBlock.mockReturnValue({ block: undefined });
    render(<TitleWithQuote />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('should call setField when title is changed', () => {
    mockUsePageBlock.mockReturnValue({ block: mockBlockData });
    render(<TitleWithQuote />);

    const titleInput = screen.getByTestId('title-input');
    fireEvent.change(titleInput, { target: { value: 'Новий заголовок' } });

    expect(mockSetField).toHaveBeenCalledWith('artistry', 'TitleWithQuote', 'title', {
      uk: 'Новий заголовок',
      en: 'Initial Title'
    });
  });

  it('should call setField when quote source text is changed', () => {
    mockUsePageBlock.mockReturnValue({ block: mockBlockData });
    render(<TitleWithQuote />);

    const sourceInput = screen.getByTestId('source-input');
    fireEvent.change(sourceInput, { target: { value: 'Нове джерело' } });

    expect(mockSetField).toHaveBeenCalledWith('artistry', 'TitleWithQuote', 'sourceText', {
      uk: 'Нове джерело',
      en: 'Initial Source'
    });
  });

  it('should call setField when quote text description is changed', () => {
    mockUsePageBlock.mockReturnValue({ block: mockBlockData });
    render(<TitleWithQuote />);

    const quoteInput = screen.getByTestId('quote-input');
    fireEvent.change(quoteInput, { target: { value: 'Нова цитата' } });

    expect(mockSetField).toHaveBeenCalledWith('artistry', 'TitleWithQuote', 'quoteText', {
      uk: 'Нова цитата',
      en: 'Initial Quote'
    });
  });
});
