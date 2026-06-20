import { fireEvent, render, screen } from '@testing-library/react';

import Home from './page';
import { fetchPreview } from '~/utils/fetchPreview';

jest.mock('~/utils/fetchPreview', () => ({
  fetchPreview: jest.fn()
}));

jest.mock('~/shared/components/header/Header');

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
