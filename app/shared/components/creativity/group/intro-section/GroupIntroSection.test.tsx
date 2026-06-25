import { fireEvent, render, screen } from '@testing-library/react';
import React, { ChangeEvent, ReactNode } from 'react';

import { GroupIntroSection } from './GroupIntroSection';
import { EditorLanguage } from '~/constants/publications';


type MockCollapsibleBlockProps = {
  children: ReactNode;
  title?: string;
  defaultExpanded?: boolean;
};

type MockCustomTextFieldProps = {
  label: string;
  value?: unknown;
  onChange?: ((e: ChangeEvent<HTMLInputElement>) => void) | ((value: unknown) => void); 
  fieldType?: string;
};

jest.mock('~/shared/components/design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children, title }: MockCollapsibleBlockProps) => (
    <div data-testid="mock-collapsible-block">
      <h2>{title}</h2>
      {children}
    </div>
  )
}));

jest.mock('~/shared/components/design-system/text-field/TextField', () => ({
  CustomTextField: ({ label, value, onChange, fieldType }: MockCustomTextFieldProps) => {
    if (fieldType === 'formatting') {
      return (
        <div data-testid={`mock-richtext-wrapper-${label}`}>
          <span data-testid={`value-${label}`}>
            {value === undefined ? 'is-undefined' : 'has-value'}
          </span>
          <button
            data-testid={`trigger-richtext-${label}`}
            onClick={() => {
              if (typeof onChange === 'function') {
                (onChange as (value: unknown) => void)({ type: 'doc', content: [{ text: 'Новий опис' }] });
              }
            }}
          />
        </div>
      );
    }

    return (
      <div data-testid={`mock-field-wrapper-${label}`}>
        <input
          data-testid={`mock-input-${label}`}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => {
            if (typeof onChange === 'function') {
              (onChange as (e: ChangeEvent<HTMLInputElement>) => void)(e);
            }
          }}
        />
      </div>
    );
  }
}));

const mockOnChange = jest.fn();

const defaultProps = {
  data: {
    parts: { uk: 'Частина 1 (Укр)', en: 'Part 1 (Eng)' },
    description: {
      uk: { type: 'doc', content: [{ text: 'Опис Укр' }] },
      en: { type: 'doc', content: [{ text: 'Description Eng' }] }
    }
  },
  currentLanguage: 'UA' as EditorLanguage,
  onChange: mockOnChange
};

describe('GroupIntroSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render fields with correct Ukrainian initial values', () => {
    render(<GroupIntroSection {...defaultProps} />);

    expect(screen.getByTestId('mock-collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId('mock-input-Частини')).toHaveValue('Частина 1 (Укр)');
    expect(screen.getByTestId('value-Опис')).toHaveTextContent('has-value');
  });

  it('should switch field values when currentLanguage is changed to EN', () => {
    const propsEN = { ...defaultProps, currentLanguage: 'EN' as EditorLanguage };
    render(<GroupIntroSection {...propsEN} />);

    expect(screen.getByTestId('mock-input-Частини')).toHaveValue('Part 1 (Eng)');
  });

  it('should call onChange with isMultilingual flag when Parts field is changed', () => {
    render(<GroupIntroSection {...defaultProps} />);

    const partsInput = screen.getByTestId('mock-input-Частини');
    fireEvent.change(partsInput, { target: { value: 'Нова частина' } });

    expect(mockOnChange).toHaveBeenCalledWith('parts', 'Нова частина', true);
  });

  it('should call onChange with isMultilingual flag when Description rich-text is changed', () => {
    render(<GroupIntroSection {...defaultProps} />);

    fireEvent.click(screen.getByTestId('trigger-richtext-Опис'));

    expect(mockOnChange).toHaveBeenCalledWith(
      'description',
      { type: 'doc', content: [{ text: 'Новий опис' }] },
      true
    );
  });

  it('should pass undefined to Description field if the value in data is null', () => {
    const propsWithNullDescription = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        description: { uk: null, en: null }
      }
    };
    
    render(<GroupIntroSection {...propsWithNullDescription} />);

    expect(screen.getByTestId('value-Опис')).toHaveTextContent('is-undefined');
  });
});
