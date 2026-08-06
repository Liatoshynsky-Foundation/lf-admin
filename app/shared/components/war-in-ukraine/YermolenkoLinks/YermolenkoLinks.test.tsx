import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { YermolenkoLinks } from './YermolenkoLinks';
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
  default: ({ title, children, hidden, onToggleVisibility }: any) => (
    <div data-testid="collapsible-block" data-hidden={hidden}>
      <span>{title}</span>
      <button type="button" data-testid="toggle-visibility-btn" onClick={onToggleVisibility}>
        Toggle Visibility
      </button>
      {children}
    </div>
  )
}));

jest.mock('../ConfigurableButtonList/ConfigurableButtonList', () => ({
  ConfigurableButtonList: ({ buttons, onChange }: any) => (
    <div data-testid="configurable-button-list" data-count={buttons.length}>
      <button type="button" data-testid="trigger-buttons-change" onClick={() => onChange([{ id: 'btn-1', link: 'https://test.com' }])}>
        Change Buttons
      </button>
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
          if (title === 'Опис') {
            onChange(e.target.value);
          } else {
            onChange(e);
          }
        }}
        data-testid={`input-${title}`}
      />
      <button type="button" data-testid={`direct-string-btn-${title}`} onClick={() => onChange('Direct String Value')}>
        Pass String
      </button>
    </div>
  )
}));

describe('YermolenkoLinks', () => {
  const mockSetField = jest.fn();
  const mockToggleVisibility = jest.fn();
  const expectedBlockId = BLOCK_IDS.YERMOLENKO_LINKS;

  const mockBlockData = {
    hidden: false,
    description: { uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } },
    buttonText: { uk: 'Підтримати Єрмоленка', en: 'Support Yermolenko' },
    buttons: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders EditBlockSkeleton when block is not loaded', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: null });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk' }));

    render(<YermolenkoLinks />);
    expect(screen.getByTestId('edit-block-skeleton')).toBeInTheDocument();
  });

  it('renders form correctly when block data is available', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', toggleBlockVisibility: mockToggleVisibility }));

    render(<YermolenkoLinks />);
    expect(screen.getByLabelText('Текст заголовка / кнопки') as HTMLInputElement).toHaveValue('Підтримати Єрмоленка');
  });

  it('renders form correctly for English locale with fallbacks', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: { hidden: true } });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'en', toggleBlockVisibility: mockToggleVisibility }));

    render(<YermolenkoLinks />);
    expect(screen.getByLabelText('Текст заголовка / кнопки') as HTMLInputElement).toHaveValue('');
  });

  it('toggles block visibility correctly', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', toggleBlockVisibility: mockToggleVisibility }));

    render(<YermolenkoLinks />);
    fireEvent.click(screen.getByTestId('toggle-visibility-btn'));
    expect(mockToggleVisibility).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId);
  });

  it('updates buttonText via event object', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', setField: mockSetField }));

    render(<YermolenkoLinks />);
    fireEvent.change(screen.getByLabelText('Текст заголовка / кнопки'), { target: { value: 'Новий текст' } });

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'buttonText', {
      uk: 'Новий текст',
      en: 'Support Yermolenko'
    });
  });

  it('updates buttonText via direct string argument', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'en', setField: mockSetField }));

    render(<YermolenkoLinks />);
    fireEvent.click(screen.getByTestId('direct-string-btn-Текст заголовка / кнопки'));

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'buttonText', {
      uk: 'Підтримати Єрмоленка',
      en: 'Direct String Value'
    });
  });

  it('updates buttonText with empty fallbacks when the block has no existing buttonText object', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: { hidden: false, description: mockBlockData.description, buttons: [] } });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', setField: mockSetField }));

    render(<YermolenkoLinks />);
    fireEvent.click(screen.getByTestId('direct-string-btn-Текст заголовка / кнопки'));

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'buttonText', {
      uk: 'Direct String Value',
      en: ''
    });
  });

  it('falls back to an empty string when the buttonText change event carries no value', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', setField: mockSetField }));

    render(<YermolenkoLinks />);
    fireEvent.change(screen.getByLabelText('Текст заголовка / кнопки'), { target: { value: '' } });

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'buttonText', {
      uk: '',
      en: 'Support Yermolenko'
    });
  });

  it('updates description field correctly', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', setField: mockSetField }));

    render(<YermolenkoLinks />);
    fireEvent.change(screen.getByLabelText('Опис'), { target: { value: 'новий опис блоку' } });

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'description', {
      uk: 'новий опис блоку',
      en: { type: 'doc', content: [] }
    });
  });

  it('updates description field when the block has no existing description object', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: { hidden: false, buttonText: mockBlockData.buttonText, buttons: [] } });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', setField: mockSetField }));

    render(<YermolenkoLinks />);
    fireEvent.change(screen.getByLabelText('Опис'), { target: { value: 'опис без попереднього стану' } });

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'description', {
      uk: 'опис без попереднього стану'
    });
  });

  it('updates buttons list', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk', setField: mockSetField }));

    render(<YermolenkoLinks />);
    fireEvent.click(screen.getByTestId('trigger-buttons-change'));

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'buttons', [
      { id: 'btn-1', link: 'https://test.com' }
    ]);
  });
});
