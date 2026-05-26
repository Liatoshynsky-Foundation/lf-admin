import { fireEvent,render, screen } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { QuoteBlock } from './QuoteBlock';

interface MockCustomTextFieldProps {
  readonly title?: string;
  readonly value?: JSONContent;
  readonly onChange?: (value: JSONContent) => void;
}

jest.mock('~/ds-components/text-field/TextField', () => ({
  __esModule: true,
  CustomTextField: ({ title = '', value, onChange }: MockCustomTextFieldProps) => (
    <div data-testid="mock-custom-text-field" data-title={title}>
      <span data-testid={`json-value-${title}`}>{JSON.stringify(value)}</span>
      <button
        data-testid={`trigger-change-${title}`}
        onClick={() => {
          const updatedJson: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Node Text' }] }]
          };
          if (onChange) {
            onChange(updatedJson);
          }
        }}
      >
        Update {title}
      </button>
    </div>
  )
}));

const mockTitleJson: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Буде, звісно, дуже багато цікавого...' }]
    }
  ]
};

const mockDescriptionJson: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Лист Бориса Лятошинського...' }]
    }
  ]
};

describe('QuoteBlock', () => {
  const mockOnMainQuoteChange = jest.fn();
  const mockOnCaptionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render both formatting text fields with correct titles and JSON content structures', () => {
    render(
      <QuoteBlock
        title={mockTitleJson}
        description={mockDescriptionJson}
        onTitleChange={mockOnMainQuoteChange}
        onDescriptionChange={mockOnCaptionChange}
      />
    );

    expect(screen.getByText(JSON.stringify(mockTitleJson))).toBeInTheDocument();
    expect(screen.getByText(JSON.stringify(mockDescriptionJson))).toBeInTheDocument();
  });

  it('should trigger corresponding parent callback hooks when a field updates its JSON state payload', () => {
    render(
      <QuoteBlock
        title={mockTitleJson}
        description={mockDescriptionJson}
        onTitleChange={mockOnMainQuoteChange}
        onDescriptionChange={mockOnCaptionChange}
      />
    );

    const expectedChangePayload: JSONContent = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Node Text' }] }]
    };

    fireEvent.click(screen.getByTestId('trigger-change-Головна цитата'));
    expect(mockOnMainQuoteChange).toHaveBeenCalledWith(expectedChangePayload);

    fireEvent.click(screen.getByTestId('trigger-change-Підпис до цитати'));
    expect(mockOnCaptionChange).toHaveBeenCalledWith(expectedChangePayload);
  });
});
