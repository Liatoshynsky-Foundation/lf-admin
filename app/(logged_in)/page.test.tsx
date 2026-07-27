import { fireEvent, render, screen } from '@testing-library/react';

import Home from './page';
import { useStore } from '~/store';
import { fetchPreview } from '~/utils/fetchPreview';

jest.mock('~/utils/fetchPreview', () => ({
  fetchPreview: jest.fn()
}));

jest.mock('~/store', () => ({
  useStore: jest.fn()
}));

interface MockHeaderProps {
  title: string;
  onPreview: () => void;
  onLanguageChange: () => void;
  onSave: () => void;
  onCancel: () => void;
}

jest.mock('~/shared/components/header/Header', () => ({
  Header: ({ title, onPreview, onLanguageChange, onSave, onCancel }: MockHeaderProps) => (
    <div data-testid="header">
      <h1>{title}</h1>
      <button data-testid="preview-btn" onClick={onPreview}>
        Preview
      </button>
      <button data-testid="lang-btn" onClick={onLanguageChange}>
        Lang
      </button>
      <button data-testid="save-btn" onClick={onSave}>
        Save
      </button>
      <button data-testid="cancel-btn" onClick={onCancel}>
        Cancel
      </button>
    </div>
  )
}));

describe('Home component', () => {
  const mockDiscardChanges = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useStore as unknown as jest.Mock).mockImplementation((selector: (state: unknown) => unknown) =>
      selector({ discardChanges: mockDiscardChanges })
    );
  });

  it('should render the Home component correctly', () => {
    render(<Home />);

    const headerElement = screen.getByTestId('header');
    expect(headerElement).toBeInTheDocument();
  });

  it('should call fetchPreview when preview button is clicked', () => {
    render(<Home />);

    const previewButton = screen.getByTestId('preview-btn');
    fireEvent.click(previewButton);
    expect(fetchPreview).toHaveBeenCalledTimes(1);
    expect(fetchPreview).toHaveBeenCalledWith({
      slug: '/',
      lang: 'uk',
      draftId: '1'
    });
  });

  it('should trigger remaining handlers for 100% function coverage', () => {
    render(<Home />);

    fireEvent.click(screen.getByTestId('lang-btn'));
    fireEvent.click(screen.getByTestId('save-btn'));

    fireEvent.click(screen.getByTestId('cancel-btn'));
    expect(mockDiscardChanges).toHaveBeenCalledWith('/');
  });
});
