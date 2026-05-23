import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { Props as CustomFormattingFieldProps } from '../../custom-formatting-field/CustomFormattingField';
import { CustomTextField } from './TextField';

jest.mock('../../custom-formatting-field/CustomFormattingField', () => ({
  __esModule: true,
  CustomFormattingField: ({ value, onChange, label }: CustomFormattingFieldProps) => (
    <div 
      data-testid="mock-formatting-field" 
      data-label={label}
      data-json-payload={JSON.stringify(value)}
      onChange={onChange} 
    />
  )
}));

describe('CustomTextField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Title & Standard Layout Constraints', () => {
    it('should render with a title', () => {
      render(<CustomTextField title="Email" />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should not render a title when not provided', () => {
      render(<CustomTextField />);
      expect(screen.queryByText('Текст заголовку')).not.toBeInTheDocument();
    });

    it('should render with placeholder and passes props to TextField', () => {
      render(<CustomTextField placeholder="Enter your name" />);

      const input = screen.getByPlaceholderText('Enter your name');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Standard Action Events', () => {
    it('should call onChange when typing', () => {
      const handleChange = jest.fn();
      render(<CustomTextField onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Hello' } });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should render with a specific value', () => {
      render(<CustomTextField value="Test value" onChange={() => {}} />);

      const input = screen.getByDisplayValue('Test value');
      expect(input).toBeInTheDocument();
    });

    it('should call onFocus and onBlur events', () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();

      render(<CustomTextField onFocus={handleFocus} onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');

      fireEvent.focus(input);
      expect(handleFocus).toHaveBeenCalled();

      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Conditional fieldType Formatter Layout Routing', () => {
    it('should render the standard StyledTextField when fieldType is missing or not formatting', () => {
      render(<CustomTextField placeholder="Standard Mode" />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.queryByTestId('mock-formatting-field')).not.toBeInTheDocument();
    });

    it('should safely alternate execution paths and mount CustomFormattingField when fieldType equals formatting', () => {
      const mockChange = jest.fn();

      const mockJsonValue = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Formatted Text Content' }]
          }
        ]
      };

      render(
        <CustomTextField 
          fieldType="formatting" 
          value={mockJsonValue} 
          onChange={mockChange} 
          label="Phone Layout" 
        />
      );

      const formattingInput = screen.getByTestId('mock-formatting-field');
      expect(formattingInput).toBeInTheDocument();
      expect(formattingInput).toHaveAttribute('data-label', 'Phone Layout');

      expect(formattingInput).toHaveAttribute('data-json-payload', JSON.stringify(mockJsonValue));

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });
});
