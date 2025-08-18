import { fireEvent, render, screen } from '@testing-library/react';

import Home from './page';
import { fetchPreview } from '~/utils/fetchPreview';

jest.mock('~/utils/fetchPreview', () => ({
  fetchPreview: jest.fn()
}));

jest.mock('~/components/header/Header', () => ({
  Header: jest.fn(({ title, onPreview, onLanguageChange, onSave, isSaving }) => (
    <div data-testid="header">
      <h1>{title}</h1>
      <button onClick={onPreview} data-testid="preview-btn">
        Preview
      </button>
      <button onClick={onLanguageChange} data-testid="lang-btn">
        Change Language
      </button>
      <button onClick={onSave} data-testid="save-btn">
        Save
      </button>
      {isSaving && <span data-testid="saving">Saving...</span>}
    </div>
  ))
}));

describe('Home component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the Home component correctly', async () => {
    render(<Home />);

    const headerElement = screen.getByTestId('header');
    expect(headerElement).toBeInTheDocument();
  });

  it('should call fetchPreview when preview button is clicked', () => {
    render(<Home />);

    const previewButton = screen.getByTestId('preview-btn');
    fireEvent.click(previewButton);
    expect(fetchPreview).toHaveBeenCalledTimes(1);
  });
});
