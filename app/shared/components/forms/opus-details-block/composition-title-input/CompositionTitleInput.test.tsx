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

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Соната' } });

    expect(onChangeText).toHaveBeenCalledWith('Соната');
  });

  it('calls onCreateNew when the create option is chosen', () => {
    const onCreateNew = jest.fn();
    render(<CompositionTitleInput {...baseProps} value="Нова" onCreateNew={onCreateNew} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const createOption = screen.getByText('Створити новий твір');
    fireEvent.click(createOption);

    expect(onCreateNew).toHaveBeenCalledTimes(1);
  });

  it('renders search suggestions and selects one', () => {
    mockUseSearchCompositions.mockReturnValue({
      data: {
        searchCompositions: [
          {
            id: 'c1',
            name: { uk: 'Після бою', en: 'After Battle' },
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

    const option = screen.getByText('Після бою');
    fireEvent.click(option);

    expect(onSelectSuggestion).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }));
  });

  it('does not render suggestions already selected in another row', () => {
    mockUseSearchCompositions.mockReturnValue({
      data: {
        searchCompositions: [
          { id: 'selected', name: { uk: 'Already selected' } },
          { id: 'available', name: { uk: 'Available suggestion' } }
        ]
      }
    });

    render(<CompositionTitleInput {...baseProps} value="" excludedSuggestionIds={['selected']} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    expect(screen.queryByText('Already selected')).not.toBeInTheDocument();
    expect(screen.getByText('Available suggestion')).toBeInTheDocument();
  });

  it('closes the suggestions popup when the input loses focus', () => {
    mockUseSearchCompositions.mockReturnValue({
      data: { searchCompositions: [{ id: 'c1', name: { uk: 'Suggestion' } }] }
    });

    render(<CompositionTitleInput {...baseProps} value="Suggestion" />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByText('Suggestion')).toBeInTheDocument();

    fireEvent.blur(input);
    expect(screen.queryByText('Suggestion')).not.toBeInTheDocument();
  });

  it('ignores selection of the no-results option', () => {
    mockUseSearchCompositions.mockReturnValue({ data: { searchCompositions: [] } });
    const onSelectSuggestion = jest.fn();

    render(<CompositionTitleInput {...baseProps} value="Missing" onSelectSuggestion={onSelectSuggestion} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const noResultsOption = screen.getByText('Нічого не знайдено');
    fireEvent.click(noResultsOption);

    expect(onSelectSuggestion).not.toHaveBeenCalled();
  });

  it('uses English title when Ukrainian title is missing, and empty string if both are missing', () => {
    mockUseSearchCompositions.mockReturnValue({
      data: {
        searchCompositions: [
          {
            id: 'c2',
            name: { en: 'Only English Title' },
            genre: 'Романс',
            year: 1920,
            sheetMusic: [],
            audios: []
          },
          {
            id: 'c3',
            name: {},
            genre: 'Романс',
            year: 1920,
            sheetMusic: [],
            audios: []
          }
        ]
      }
    });
    render(<CompositionTitleInput {...baseProps} value="Test" />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    expect(screen.getByText('Only English Title')).toBeInTheDocument();
  });

  it('does not call onChangeText if onInputChange reason is not input or clear', () => {
    const onChangeText = jest.fn();
    render(<CompositionTitleInput {...baseProps} onChangeText={onChangeText} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onChangeText).not.toHaveBeenCalled();
  });

  it('handles null and string values in onChange gracefully', () => {
    const onSelectSuggestion = jest.fn();
    render(<CompositionTitleInput {...baseProps} value="Текст" onSelectSuggestion={onSelectSuggestion} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSelectSuggestion).not.toHaveBeenCalled();
  });

  it('does not call onSelectSuggestion if suggestion object is missing', () => {
    mockUseSearchCompositions.mockReturnValue({
      data: {
        searchCompositions: [
          {
            id: 'missing-suggestion',
            name: { uk: 'Без Саджешна' },
            genre: 'Романс',
            year: 1920,
            sheetMusic: [],
            audios: []
          }
        ]
      }
    });

    const onSelectSuggestion = jest.fn();

    const { container } = render(
      <CompositionTitleInput {...baseProps} value="Без" onSelectSuggestion={onSelectSuggestion} />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const autocomplete = container.querySelector('.MuiAutocomplete-root');
    if (autocomplete) {
      fireEvent.change(input, { target: { value: '' } });
    }

    expect(onSelectSuggestion).not.toHaveBeenCalled();
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
            name: { en: 'After Battle' },
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
            name: {},
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
