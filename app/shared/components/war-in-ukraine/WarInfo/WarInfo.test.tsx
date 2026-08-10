import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { WarInfo } from './WarInfo';
import { BLOCK_IDS } from '~/constants/pageBlocks';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

jest.mock('~/shared/hooks/use-page-block/usePageBlock');
jest.mock('~/store');

jest.mock('~/shared/components/edit-block-skeleton/EditBlockSkeleton', () => ({
  EditBlockSkeleton: () => <div data-testid="edit-block-skeleton" />
}));

jest.mock('~/shared/components/design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ title, children }: any) => (
    <div data-testid="collapsible-block">
      <span>{title}</span>
      {children}
    </div>
  )
}));

jest.mock('~/ds-components/text-field/TextField', () => ({
  CustomTextField: ({ title, value, onChange }: any) => (
    <div data-testid={`field-${title}`}>
      <input
        aria-label={title}
        value={typeof value === 'object' && value !== null ? JSON.stringify(value) : (value || '')}
        onChange={(e) => {
          if (title === 'Опис блоку') {
            onChange(e.target.value);
          } else {
            onChange(e);
          }
        }}
        data-testid={`input-${title}`}
      />
      <button 
        type="button" 
        data-testid={`direct-string-btn-${title}`} 
        onClick={() => onChange('Прямий рядок заголовку')}
      >
        Set Direct String
      </button>
    </div>
  )
}));

describe('WarInfo', () => {
  const mockSetField = jest.fn();
  const expectedBlockId = BLOCK_IDS.WAR_INFO;

  const mockBlockData = {
    title: { uk: 'Позиція фонду', en: 'Foundation stance' },
    description: {
      uk: { type: 'doc', content: [] },
      en: { type: 'doc', content: [] }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders EditBlockSkeleton when block is not loaded', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: null });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk' }));

    render(<WarInfo />);
    expect(screen.getByTestId('edit-block-skeleton')).toBeInTheDocument();
  });

  it('renders form correctly when block data is available', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk' }));

    render(<WarInfo />);
    expect(screen.getByLabelText('Заголовок блоку') as HTMLInputElement).toHaveValue('Позиція фонду');
  });

  it('renders correctly for English locale with fallbacks', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: {} });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'en' }));

    render(<WarInfo />);
    expect(screen.getByLabelText('Заголовок блоку') as HTMLInputElement).toHaveValue('');
  });

  it('updates title using React change event', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => ({ locale: 'uk', setField: mockSetField }[selector.toString().includes('locale') ? 'locale' : 'setField'] || selector({ locale: 'uk', setField: mockSetField })));

    render(<WarInfo />);
    fireEvent.change(screen.getByLabelText('Заголовок блоку'), { target: { value: 'Новий заголовок' } });

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'title', {
      uk: 'Новий заголовок',
      en: 'Foundation stance'
    });
  });

  it('updates title using direct string argument', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'en', setField: mockSetField }));

    render(<WarInfo />);
    fireEvent.click(screen.getByTestId('direct-string-btn-Заголовок блоку'));

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'title', {
      uk: 'Позиція фонду',
      en: 'Прямий рядок заголовку'
    });
  });

  it('updates title with empty fallbacks when the block has no existing title object', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: { description: mockBlockData.description } });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', setField: mockSetField }));

    render(<WarInfo />);
    fireEvent.click(screen.getByTestId('direct-string-btn-Заголовок блоку'));

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'title', {
      uk: 'Прямий рядок заголовку',
      en: ''
    });
  });

  it('falls back to an empty string when the title change event carries no value', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', setField: mockSetField }));

    render(<WarInfo />);
    fireEvent.change(screen.getByLabelText('Заголовок блоку'), { target: { value: '' } });

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'title', {
      uk: '',
      en: 'Foundation stance'
    });
  });

  it('updates description field with localized JSONContent', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', setField: mockSetField }));

    render(<WarInfo />);
    fireEvent.change(screen.getByLabelText('Опис блоку'), { target: { value: 'оновлений текст опису' } });

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'description', {
      uk: 'оновлений текст опису',
      en: { type: 'doc', content: [] }
    });
  });

  it('updates description field when the block has no existing description object', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: { title: mockBlockData.title } });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', setField: mockSetField }));

    render(<WarInfo />);
    fireEvent.change(screen.getByLabelText('Опис блоку'), { target: { value: 'опис без попереднього стану' } });

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'description', {
      uk: 'опис без попереднього стану'
    });
  });
});
