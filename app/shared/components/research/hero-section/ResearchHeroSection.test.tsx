import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import type { JSONContent } from '@tiptap/react';
import React from 'react';

import { ResearchHeroSection } from './ResearchHeroSection';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

jest.mock('~/store');
jest.mock('~/shared/hooks/use-page-block/usePageBlock');

jest.mock('~/shared/components/edit-block-skeleton/EditBlockSkeleton', () => ({
  EditBlockSkeleton: () => <div data-testid="skeleton">Skeleton</div>
}));

jest.mock('~/shared/components/design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="collapsible-block">
      <span>{title}</span>
      {children}
    </div>
  )
}));

interface MockCustomTextFieldProps {
  label: string;
  value?: JSONContent | string;
  onChange: (value: JSONContent | string) => void;
}

jest.mock('~/shared/components/design-system/text-field/TextField', () => ({
  CustomTextField: ({ value, onChange, label }: MockCustomTextFieldProps) => (
    <div data-testid="custom-text-field">
      <label>{label}</label>
      <input
        aria-label={label}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        data-testid={`mock-change-${label}`}
        onClick={() =>
          onChange({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ text: 'Текст з редактора TipTap' }]
              }
            ]
          })
        }
      >
        Mock TipTap Change
      </button>
    </div>
  )
}));

describe('ResearchHeroSection Component', () => {
  const mockUsePageBlock = usePageBlock as jest.Mock;
  const mockUseStore = useStore as unknown as jest.Mock;
  const mockSetField = jest.fn();

  const mockBlockData = {
    title: { uk: 'Дослідження та наукові праці', en: 'Research and Scientific Works' },
    quote: {
      text: { uk: 'Початкова цитата', en: 'Initial Quote' },
      source: { uk: 'Початкове джерело', en: 'Initial Source' }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseStore.mockImplementation((selector: (state: { locale: 'uk' | 'en'; setField: jest.Mock }) => unknown) => {
      return selector({
        locale: 'uk',
        setField: mockSetField
      });
    });
  });

  it('should render EditBlockSkeleton when block is undefined', () => {
    mockUsePageBlock.mockReturnValue({ block: undefined });
    render(<ResearchHeroSection />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('should render read-only title and initial values', () => {
    mockUsePageBlock.mockReturnValue({ block: mockBlockData });
    render(<ResearchHeroSection />);

    expect(screen.getByText('Дослідження та наукові праці')).toBeInTheDocument();
    expect(screen.getByLabelText('Цитата')).toHaveValue('Початкова цитата');
    expect(screen.getByLabelText('Підпис до цитати')).toHaveValue('Початкове джерело');
  });

  it('should call setField when quote text is changed', () => {
    mockUsePageBlock.mockReturnValue({ block: mockBlockData });
    render(<ResearchHeroSection />);

    const quoteInput = screen.getByLabelText('Цитата');
    fireEvent.change(quoteInput, { target: { value: 'Нова цитата' } });

    expect(mockSetField).toHaveBeenCalledWith(PAGE_IDS.RESEARCH, BLOCK_IDS.RESEARCH_HERO, 'quote', {
      ...mockBlockData.quote,
      text: {
        ...mockBlockData.quote.text,
        uk: 'Нова цитата'
      }
    });
  });

  it('should call setField when quote source is changed', () => {
    mockUsePageBlock.mockReturnValue({ block: mockBlockData });
    render(<ResearchHeroSection />);

    const sourceInput = screen.getByLabelText('Підпис до цитати');
    fireEvent.change(sourceInput, { target: { value: 'Нове джерело' } });

    expect(mockSetField).toHaveBeenCalledWith(PAGE_IDS.RESEARCH, BLOCK_IDS.RESEARCH_HERO, 'quote', {
      ...mockBlockData.quote,
      source: {
        ...mockBlockData.quote.source,
        uk: 'Нове джерело'
      }
    });
  });

  it('should handle TipTap document objects in onChange via toPlainText', () => {
    mockUsePageBlock.mockReturnValue({ block: mockBlockData });
    render(<ResearchHeroSection />);

    const tipTapButton = screen.getByTestId('mock-change-Цитата');
    fireEvent.click(tipTapButton);

    expect(mockSetField).toHaveBeenCalledWith(PAGE_IDS.RESEARCH, BLOCK_IDS.RESEARCH_HERO, 'quote', {
      ...mockBlockData.quote,
      text: {
        ...mockBlockData.quote.text,
        uk: 'Текст з редактора TipTap'
      }
    });
  });
});
