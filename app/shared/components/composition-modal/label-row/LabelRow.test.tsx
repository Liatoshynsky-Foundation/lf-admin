import { render, screen } from '@testing-library/react';
import React from 'react';

import LabelRow from './LabelRow';

jest.mock('~/lib/utils/sxToArray', () => ({
  __esModule: true,
  sxToArray: jest.fn(() => [])
}));

describe('LabelRow', () => {
  const renderRow = (overrides = {}) => {
    return render(<LabelRow {...overrides} />);
  };

  it('should render with the default fallback title text when no title prop is supplied', () => {
    renderRow();

    const titleElement = screen.getByText('Текст');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveAttribute('title', 'Текст');
  });

  it('should render with a custom title when a specific title prop string is provided', () => {
    const customTitle = 'Учасники Секції';
    renderRow({ title: customTitle });

    const titleElement = screen.getByText(customTitle);
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveAttribute('title', customTitle);
  });

  it('should render children when provided', () => {
    renderRow({ children: <div data-testid="custom-child">Child Element</div> });

    const childElement = screen.getByTestId('custom-child');
    expect(childElement).toBeInTheDocument();
    expect(childElement).toHaveTextContent('Child Element');
  });
});
