import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import LabelActionRow from './LabelActionRow';

jest.mock('~/lib/utils/sxToArray', () => ({
  __esModule: true,
  sxToArray: jest.fn(() => [])
}));

describe('LabelActionRow', () => {
  let actionMock: jest.Mock;

  beforeEach(() => {
    actionMock = jest.fn();
  });

  const renderRow = (overrides = {}) => {
    return render(<LabelActionRow action={actionMock} {...overrides} />);
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

  it('should trigger the corresponding action callback function exactly once when the action button is clicked', () => {
    renderRow();

    const addButton = screen.getByRole('button', { name: 'Додати' });
    fireEvent.click(addButton);

    expect(actionMock).toHaveBeenCalledTimes(1);
  });
});
