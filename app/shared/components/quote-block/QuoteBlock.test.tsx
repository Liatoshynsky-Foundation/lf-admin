import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { QuoteBlock } from './QuoteBlock';

describe('QuoteBlock', () => {
  const mockOnMainQuoteChange = jest.fn();
  const mockOnCaptionChange = jest.fn();
  const mockDefaultMainQuote = 'Буде, звісно, дуже багато цікавого, але всього не почуєш';
  const mockDefaultCaption = 'Лист Бориса Лятошинського Маргариті Царевич';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render both text fields with correct titles and default values', () => {
    render(
      <QuoteBlock
        defaultMainQuote={mockDefaultMainQuote}
        defaultCaption={mockDefaultCaption}
        onMainQuoteChange={mockOnMainQuoteChange}
        onCaptionChange={mockOnCaptionChange}
      />
    );

    expect(screen.getByText('Підпис до цитати')).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockDefaultMainQuote)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockDefaultCaption)).toBeInTheDocument();
  });

  it('should call callback functions when user types in the fields', async () => {
    const user = userEvent.setup();
    render(
      <QuoteBlock
        defaultMainQuote={mockDefaultMainQuote}
        defaultCaption={mockDefaultCaption}
        onMainQuoteChange={mockOnMainQuoteChange}
        onCaptionChange={mockOnCaptionChange}
      />
    );

    await user.type(screen.getByDisplayValue(mockDefaultMainQuote), 'a');
    await user.type(screen.getByDisplayValue(mockDefaultCaption), 'b');

    expect(mockOnMainQuoteChange).toHaveBeenCalledWith(`${mockDefaultMainQuote}a`);
    expect(mockOnCaptionChange).toHaveBeenCalledWith(`${mockDefaultCaption}b`);
  });
});
