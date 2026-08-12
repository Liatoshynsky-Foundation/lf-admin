import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { PrincipleOfHope } from './PrincipleOfHope';
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
      <button
        type="button"
        data-testid="trigger-buttons-change"
        onClick={() => onChange([{ id: 'btn-1', link: 'https://test.com' }])}
      >
        Change Buttons List
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
      <button
        type="button"
        data-testid={`direct-string-btn-${title}`}
        onClick={() => onChange('Пряме значення рядком')}
      >
        Set Direct String
      </button>
    </div>
  )
}));

describe('PrincipleOfHope', () => {
  const mockSetField = jest.fn();
  const expectedBlockId = BLOCK_IDS.PRINCIPLE_OF_HOPE;

  const mockBlockData = {
    hidden: false,
    description: {
      uk: { type: 'doc', content: [] },
      en: { type: 'doc', content: [] }
    },
    buttonText: {
      uk: 'Підтримати фонд',
      en: 'Support foundation'
    },
    buttonLink: 'https://privat24.ua',
    buttons: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders EditBlockSkeleton when block is not loaded (falsy block branch)', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: null });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk' }));

    render(<PrincipleOfHope />);

    expect(screen.getByTestId('edit-block-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('collapsible-block')).not.toBeInTheDocument();
  });

  it('renders form correctly when block data is available for Ukrainian locale', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'uk' }));

    render(<PrincipleOfHope />);

    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByLabelText('Текст головної кнопки') as HTMLInputElement).toHaveValue('Підтримати фонд');
    expect(screen.getByLabelText('Посилання головної кнопки (URL)') as HTMLInputElement).toHaveValue('https://privat24.ua');
  });

  it('renders form correctly for English locale with fallback when fields are missing', () => {
    const incompleteBlock = {
      hidden: true,
      description: {},
    };

    (usePageBlock as jest.Mock).mockReturnValue({ block: incompleteBlock });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => selector({ locale: 'en' }));

    render(<PrincipleOfHope />);

    expect(screen.getByTestId('collapsible-block')).toHaveAttribute('data-hidden', 'true');
    expect(screen.getByLabelText('Текст головної кнопки') as HTMLInputElement).toHaveValue('');
    expect(screen.getByTestId('configurable-button-list')).toHaveAttribute('data-count', '0');
  });

  it('toggles block visibility correctly via CollapsibleBlock', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<PrincipleOfHope />);

    fireEvent.click(screen.getByTestId('toggle-visibility-btn'));

    expect(mockSetField).toHaveBeenCalledTimes(1);
    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'hidden', true);
  });

  it('toggles block visibility correctly from a hidden state', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: { ...mockBlockData, hidden: true } });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<PrincipleOfHope />);

    fireEvent.click(screen.getByTestId('toggle-visibility-btn'));

    expect(mockSetField).toHaveBeenCalledWith('war-in-ukraine', expectedBlockId, 'hidden', false);
  });

  it('updates main button link directly as a string value', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<PrincipleOfHope />);

    const linkInput = screen.getByLabelText('Посилання головної кнопки (URL)');
    fireEvent.change(linkInput, { target: { value: 'https://new-url.com' } });

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'buttonLink',
      'https://new-url.com'
    );
  });

  it('updates main button link using a direct string argument', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<PrincipleOfHope />);

    fireEvent.click(screen.getByTestId('direct-string-btn-Посилання головної кнопки (URL)'));

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'buttonLink',
      'Пряме значення рядком'
    );
  });

  it('updates localized button text preserving other locales and handling missing fields', () => {
    const blockWithoutEn = {
      ...mockBlockData,
      buttonText: { uk: 'Тільки українська' }
    };

    (usePageBlock as jest.Mock).mockReturnValue({ block: blockWithoutEn });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'en', setField: mockSetField };
      return selector(state);
    });

    render(<PrincipleOfHope />);

    const textInput = screen.getByLabelText('Текст головної кнопки');
    fireEvent.change(textInput, { target: { value: 'Only English' } });

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'buttonText',
      {
        uk: 'Тільки українська',
        en: 'Only English'
      }
    );
  });

  it('updates buttonText with empty fallbacks when the field is entirely absent from the block', () => {
    const blockWithoutButtonText = {
      ...mockBlockData,
      buttonText: undefined
    };

    (usePageBlock as jest.Mock).mockReturnValue({ block: blockWithoutButtonText });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<PrincipleOfHope />);

    fireEvent.click(screen.getByTestId('direct-string-btn-Текст головної кнопки'));

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'buttonText',
      {
        uk: 'Пряме значення рядком',
        en: ''
      }
    );
  });

  it('updates description field with localized JSONContent', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<PrincipleOfHope />);

    const descInput = screen.getByLabelText('Опис');
    fireEvent.change(descInput, { target: { value: 'new description text' } });

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'description',
      expect.objectContaining({
        uk: 'new description text'
      })
    );
  });

  it('updates description field when the block has no existing description object', () => {
    const blockWithoutDescription = {
      ...mockBlockData,
      description: undefined
    };

    (usePageBlock as jest.Mock).mockReturnValue({ block: blockWithoutDescription });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<PrincipleOfHope />);

    const descInput = screen.getByLabelText('Опис');
    fireEvent.change(descInput, { target: { value: 'опис без попереднього стану' } });

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'description',
      { uk: 'опис без попереднього стану' }
    );
  });

  it('updates buttons list when ConfigurableButtonList triggers onChange', () => {
    (usePageBlock as jest.Mock).mockReturnValue({ block: mockBlockData });
    (useStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { locale: 'uk', setField: mockSetField };
      return selector(state);
    });

    render(<PrincipleOfHope />);

    fireEvent.click(screen.getByTestId('trigger-buttons-change'));

    expect(mockSetField).toHaveBeenCalledWith(
      'war-in-ukraine',
      expectedBlockId,
      'buttons',
      [{ id: 'btn-1', link: 'https://test.com' }]
    );
  });
});
