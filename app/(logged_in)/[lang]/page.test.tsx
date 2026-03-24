import { act, render, screen } from '@testing-library/react';
import React from 'react';

import Home from './page';
import { fetchPreview } from '~/lib/utils/fetchPreview';
import { useStore } from '~/store';

// 1. Мокаємо fetchPreview
jest.mock('~/lib/utils/fetchPreview', () => ({
  fetchPreview: jest.fn()
}));

// 2. Мокаємо next-intl
jest.mock('next-intl', () => ({
  useLocale: () => 'uk',
  useTranslations: () => (key: string) => (key === 'title' ? 'Про нас' : key)
}));

// 3. Мокаємо useStore для Zustand
const mockDiscardChanges = jest.fn();
jest.mock('~/store', () => ({
  useStore: jest.fn()
}));

// 4. Мокаємо Header
jest.mock('~/shared/components/header/Header', () => ({
  Header: jest.fn(({ title, onPreview, onCancel }) => (
    <div data-testid="header">
      <h1>{title}</h1>
      <button onClick={onPreview} data-testid="preview-btn">Preview</button>
      <button onClick={onCancel} data-testid="cancel-btn">Cancel</button>
    </div>
  ))
}));

describe('Home component', () => {
  const mockParams = Promise.resolve({ lang: 'uk' });

  beforeEach(() => {
    jest.clearAllMocks();
    (useStore as unknown as jest.Mock).mockImplementation((selector: (state: { discardChanges: jest.Mock }) => unknown) =>
      selector({ discardChanges: mockDiscardChanges })
    );
  });

  it('should render the Home component correctly', async () => {
    await act(async () => {
      render(<Home params={mockParams} />);
    });

    const headerElement = await screen.findByTestId('header');
    const titleElement = await screen.findByRole('heading', { level: 1 });

    expect(headerElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent('Про нас');
  });

  it('should call fetchPreview when preview button is clicked', async () => {
    await act(async () => {
      render(<Home params={mockParams} />);
    });

    const previewButton = await screen.findByTestId('preview-btn');

    await act(async () => {
      previewButton.click();
    });

    expect(fetchPreview).toHaveBeenCalled();
  });

  it('should call discardChanges when cancel button is clicked', async () => {
    await act(async () => {
      render(<Home params={mockParams} />);
    });

    const cancelButton = await screen.findByTestId('cancel-btn');

    await act(async () => {
      cancelButton.click();
    });

    expect(mockDiscardChanges).toHaveBeenCalledWith('/');
  });
});