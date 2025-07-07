import { render, screen } from '@testing-library/react';
import React from 'react';

import { QuoteBlock } from './QuoteBlock';

describe('QuoteBlock', () => {
  it('should render both text fields with correct titles and default values', () => {
    render(<QuoteBlock />);

    expect(screen.getByText('Головна цитата')).toBeInTheDocument();
    expect(screen.getByText('Підпис до цитати')).toBeInTheDocument();

    expect(screen.getByDisplayValue(/Буде, звісно, дуже багато цікавого, але всього не почуєш/i)).toBeInTheDocument();

    expect(screen.getByDisplayValue(/Лист Бориса Лятошинського Маргариті Царевич/i)).toBeInTheDocument();
  });
});
