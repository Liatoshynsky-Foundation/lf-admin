import React from 'react';


jest.mock('~/lib/utils/fetchPreview', () => ({
  fetchPreview: jest.fn()
}));

jest.mock('next-intl', () => ({
  useLocale: () => 'uk',
  useTranslations: () => (key: string) => (key === 'title' ? 'Про нас' : key)
}));

const mockDiscardChanges = jest.fn();

interface StoreState {
    discardChanges: (url: string) => void;
}

jest.mock('~/store', () => ({
  useStore: (fn: (state: StoreState) => StoreState) => fn({ discardChanges: mockDiscardChanges })
}));

jest.mock('~/shared/components/header/Header', () => ({
  Header: jest.fn(({ title, onPreview, onSave, onCancel }) => (
    <div data-testid="header">
      <h1>{title}</h1>
      <button onClick={onPreview} data-testid="preview-btn">Preview</button>
      <button onClick={onSave} data-testid="save-btn">Save</button>
      <button onClick={onCancel} data-testid="cancel-btn">Cancel</button>
    </div>
  ))
}));

describe('Home component', () => {
  // const mockParams = Promise.resolve({ lang: 'uk' });
  //
  // beforeEach(() => {
  //   jest.clearAllMocks();
  // });
  //
  // it('should render the Home component correctly', async () => {
  //   await act(async () => {
  //     render(<Home params={mockParams} />);
  //   });
  //
  //   const headerElement = await screen.findByTestId('header');
  //   const titleElement = await screen.findByRole('heading', { level: 1 });
  //
  //   expect(headerElement).toBeInTheDocument();
  //   expect(titleElement).toHaveTextContent('Про нас');
  // });
  //
  // it('should call fetchPreview when preview button is clicked', async () => {
  //   await act(async () => {
  //     render(<Home params={mockParams} />);
  //   });
  //
  //   const previewButton = await screen.findByTestId('preview-btn');
  //
  //   await act(async () => {
  //     fireEvent.click(previewButton);
  //   });
  //
  //   expect(fetchPreview).toHaveBeenCalledWith(expect.objectContaining({
  //     lang: 'uk',
  //     slug: '/'
  //   }));
  // });
  //
  // it('should call discardChanges when cancel button is clicked', async () => {
  //   await act(async () => {
  //     render(<Home params={mockParams} />);
  //   });
  //
  //   const cancelButton = await screen.findByTestId('cancel-btn');
  //
  //   fireEvent.click(cancelButton);
  //
  //   expect(mockDiscardChanges).toHaveBeenCalledWith('/');
  // });
});