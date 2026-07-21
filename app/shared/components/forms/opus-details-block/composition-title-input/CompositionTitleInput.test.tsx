import { fireEvent, render, screen } from '@testing-library/react';

import CompositionTitleInput from './CompositionTitleInput';

const mockUseSearchCompositions = jest.fn();

jest.mock('~/shared/hooks/use-opuses/useOpuses', () => ({
  useSearchCompositions: (search: string, options: { skip?: boolean }) => mockUseSearchCompositions(search, options)
}));

jest.mock('~/shared/hooks/use-debounce/useDebounce', () => ({
  useDebounce: <T,>(value: T) => value
}));

const baseProps = {
  value: '',
  onChangeText: jest.fn(),
  onSelectSuggestion: jest.fn(),
  onCreateNew: jest.fn()
};

describe('CompositionTitleInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchCompositions.mockReturnValue({ data: undefined });
  });

  it('calls onChangeText while typing', () => {
    const onChangeText = jest.fn();
    render(<CompositionTitleInput {...baseProps} onChangeText={onChangeText} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Соната' } });

    expect(onChangeText).toHaveBeenCalledWith('Соната');
  });

  it('calls onCreateNew when the create option is chosen', () => {
    const onCreateNew = jest.fn();
    render(<CompositionTitleInput {...baseProps} value="Нова" onCreateNew={onCreateNew} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.click(screen.getByText('Створити новий твір'));

    expect(onCreateNew).toHaveBeenCalledTimes(1);
  });

  it('renders search suggestions and selects one', () => {
    mockUseSearchCompositions.mockReturnValue({
      data: {
        searchCompositions: [
          {
            id: 'c1',
            title: { uk: 'Після бою', en: 'After Battle' },
            genre: 'Романс',
            year: 1920,
            sheetMusic: [],
            audios: []
          }
        ]
      }
    });
    const onSelectSuggestion = jest.fn();
    render(<CompositionTitleInput {...baseProps} value="Після" onSelectSuggestion={onSelectSuggestion} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.click(screen.getByText('Після бою'));

    expect(onSelectSuggestion).toHaveBeenCalledWith(expect.objectContaining({ genre: 'Романс' }));
  });

  it('does not trigger actions when free solo text is submitted', () => {
    const onSelectSuggestion = jest.fn();
    const onCreateNew = jest.fn();

    render(
      <CompositionTitleInput
        {...baseProps}
        value="Власний текст"
        onSelectSuggestion={onSelectSuggestion}
        onCreateNew={onCreateNew}
      />
    );

    const input = screen.getByRole('combobox');

    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(onSelectSuggestion).not.toHaveBeenCalled();
    expect(onCreateNew).not.toHaveBeenCalled();
  });

  it('renders english title when ukrainian title is missing', () => {
    mockUseSearchCompositions.mockReturnValue({
      data: {
        searchCompositions: [
          {
            id: 'c1',
            title: { uk: null, en: 'After Battle' },
            genre: 'Romance',
            year: 1920,
            sheetMusic: [],
            audios: []
          }
        ]
      }
    });

    render(<CompositionTitleInput {...baseProps} value="After" />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    expect(screen.getByText('After Battle')).toBeInTheDocument();
  });

  it('renders empty title when both ukrainian and english titles are missing', () => {
    mockUseSearchCompositions.mockReturnValue({
      data: {
        searchCompositions: [
          {
            id: 'c1',
            title: { uk: null, en: null },
            genre: 'Romance',
            year: 1920,
            sheetMusic: [],
            audios: []
          }
        ]
      }
    });

    render(<CompositionTitleInput {...baseProps} value="A" />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    expect(screen.getByText('Створити новий твір')).toBeInTheDocument();
  });
});
