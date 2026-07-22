import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ReactElement, ReactNode, useState } from 'react';

import OpusDetailsBlock from './OpusDetailsBlock';
import { initialOpusDetails, OPUS_DETAILS_LABELS } from '~/constants/opus';
import type { OpusCompositionData, OpusCompositionSuggestion, OpusDetailsErrors, OpusDetailsValue } from '~/types/opus';

let mockSuggestion: OpusCompositionSuggestion = {};

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  MediaModal: (): null => null
}));

jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: { children: ReactNode }): ReactElement => <>{children}</>
}));

jest.mock('./year-picker/YearPicker', () => ({
  __esModule: true,
  default: ({ label, value, onChange }: { label: string; value: string; onChange: (year: string) => void }) => (
    <div>
      <input aria-label={label} readOnly value={value || ''} />
      <button type="button" aria-label={`set-${label}`} onClick={() => onChange('1999')}>
        Set
      </button>
    </div>
  )
}));

jest.mock('./composition-title-input/CompositionTitleInput', () => ({
  __esModule: true,
  default: ({
    value,
    onChangeText,
    onSelectSuggestion,
    onCreateNew
  }: {
    value: string;
    onChangeText: (next: string) => void;
    onSelectSuggestion: (suggestion: OpusCompositionSuggestion) => void;
    onCreateNew: () => void;
  }): ReactElement => (
    <div>
      <input aria-label="composition-title" value={value} onChange={(event) => onChangeText(event.target.value)} />
      <button type="button" aria-label="select-suggestion" onClick={() => onSelectSuggestion(mockSuggestion)}>
        suggest
      </button>
      <button type="button" aria-label="create-new" onClick={onCreateNew}>
        create
      </button>
    </div>
  )
}));

const makeComposition = (id: string, title: string): OpusCompositionData => ({
  id,
  title,
  genre: '',
  year: '',
  audios: [],
  notes: []
});

const Harness = ({
  initial = initialOpusDetails,
  errors = { number: '', name: '', creationYear: '' }
}: {
  initial?: OpusDetailsValue;
  errors?: OpusDetailsErrors;
}): ReactElement => {
  const [value, setValue] = useState<OpusDetailsValue>(initial);

  return <OpusDetailsBlock value={value} onChange={setValue} errors={errors} />;
};

describe('OpusDetailsBlock', () => {
  it('renders the new detail fields', () => {
    render(<Harness />);

    expect(screen.getByLabelText('Номер *')).toBeInTheDocument();
    expect(screen.getByLabelText('Назва опусу *')).toBeInTheDocument();
    expect(screen.getByLabelText('Рік створення *')).toBeInTheDocument();
    expect(screen.getByLabelText('Рік закінчення')).toBeInTheDocument();
    expect(screen.getByLabelText('Жанр')).toBeInTheDocument();
  });

  it('shows validation errors for the required fields', () => {
    render(<Harness errors={{ number: 'Вкажіть номер.', name: 'Введіть назву групи.', creationYear: '' }} />);

    expect(screen.getByText('Вкажіть номер.')).toBeInTheDocument();
    expect(screen.getByText('Введіть назву групи.')).toBeInTheDocument();
  });

  it('updates the opus title field', () => {
    render(<Harness />);

    const nameField = screen.getByLabelText('Назва опусу *');
    fireEvent.change(nameField, { target: { value: 'Соната' } });
    expect(nameField).toHaveValue('Соната');
  });

  it('updates the number, note and number-kind fields', () => {
    render(<Harness />);

    const numberField = screen.getByLabelText('Номер *');
    fireEvent.change(numberField, { target: { value: '14' } });
    expect(numberField).toHaveValue('14');

    const noteField = screen.getByLabelText('Примітка');
    fireEvent.change(noteField, { target: { value: 'bis' } });
    expect(noteField).toHaveValue('bis');

    const genreField = screen.getByLabelText('Жанр');
    fireEvent.change(genreField, { target: { value: 'Симфонія' } });
    expect(genreField).toHaveValue('Симфонія');

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'sine op.' }));
    expect(screen.getByRole('combobox')).toHaveTextContent('sine op.');
  });

  it('adds an inline composition row when "Додати" is clicked', () => {
    render(<Harness />);

    expect(screen.queryAllByRole('button', { name: 'Редагувати' })).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: 'Додати' }));

    expect(screen.getAllByRole('button', { name: 'Редагувати' })).toHaveLength(1);
  });

  it('updates the title of the targeted composition only', () => {
    const initial: OpusDetailsValue = {
      ...initialOpusDetails,
      compositions: [makeComposition('c1', 'Перший'), makeComposition('c2', 'Другий')]
    };
    render(<Harness initial={initial} />);

    const titleInputs = screen.getAllByLabelText('composition-title');
    fireEvent.change(titleInputs[0], { target: { value: 'Оновлений' } });

    expect(screen.getAllByLabelText('composition-title')[0]).toHaveValue('Оновлений');
    expect(screen.getAllByLabelText('composition-title')[1]).toHaveValue('Другий');
  });

  it('fills a composition from a full suggestion and opens the edit modal', () => {
    const initial: OpusDetailsValue = {
      ...initialOpusDetails,
      compositions: [makeComposition('c1', ''), makeComposition('c2', 'Другий')]
    };
    render(<Harness initial={initial} />);

    mockSuggestion = {
      id: 'sugg-1',
      title: { uk: 'Повна назва' },
      genre: 'Соната',
      year: 1921,
      audios: [{ name: 'Мій запис', url: 'https://cdn/a.mp3' }],
      sheetMusic: [{ url: 'https://cdn/s.pdf', name: 'Партитура', publishDate: '2021' }]
    };
    fireEvent.click(screen.getAllByRole('button', { name: 'select-suggestion' })[0]);

    expect(screen.getAllByLabelText('composition-title')[0]).toHaveValue('Повна назва');
    expect(screen.getAllByLabelText('composition-title')[1]).toHaveValue('Другий');

    fireEvent.click(screen.getAllByRole('button', { name: 'Редагувати' })[0]);

    expect(screen.getByText('Редагування композиції')).toBeInTheDocument();
    expect(screen.getByText('Мій запис')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Партитура')).toBeInTheDocument();
  });

  it('fills compositions from partial and empty suggestions', () => {
    const initial: OpusDetailsValue = {
      ...initialOpusDetails,
      compositions: [makeComposition('c1', ''), makeComposition('c2', '')]
    };
    render(<Harness initial={initial} />);

    mockSuggestion = {
      title: { uk: null, en: 'English title' },
      genre: null,
      year: null,
      audios: [{ url: 'https://cdn/audio.mp3' }, { name: null, url: null }],
      sheetMusic: [{ url: 'https://cdn/sheet.pdf' }, { url: null as unknown as string }]
    };
    fireEvent.click(screen.getAllByRole('button', { name: 'select-suggestion' })[0]);
    expect(screen.getAllByLabelText('composition-title')[0]).toHaveValue('English title');

    mockSuggestion = { title: null, audios: null, sheetMusic: null };
    fireEvent.click(screen.getAllByRole('button', { name: 'select-suggestion' })[1]);
    expect(screen.getAllByLabelText('composition-title')[1]).toHaveValue('');
  });

  it('opens the create modal from the composition input', () => {
    const initial: OpusDetailsValue = {
      ...initialOpusDetails,
      compositions: [makeComposition('c1', 'Твір')]
    };
    render(<Harness initial={initial} />);

    fireEvent.click(screen.getByRole('button', { name: 'create-new' }));

    expect(screen.getByText('Нова композиція')).toBeInTheDocument();
  });

  it('applies the modal changes on submit and closes it', async () => {
    const initial: OpusDetailsValue = {
      ...initialOpusDetails,
      compositions: [makeComposition('c1', 'Перший'), makeComposition('c2', 'Другий')]
    };
    render(<Harness initial={initial} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Редагувати' })[0]);
    expect(screen.getByText('Редагування композиції')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    await waitFor(() => expect(screen.queryByText('Редагування композиції')).not.toBeInTheDocument());
  });

  it('reorders compositions via drag and drop', () => {
    const initial: OpusDetailsValue = {
      ...initialOpusDetails,
      compositions: [makeComposition('c1', 'Перший'), makeComposition('c2', 'Другий')]
    };
    render(<Harness initial={initial} />);

    fireEvent.dragEnter(screen.getAllByLabelText('Перемістити')[1]);
    expect(screen.getAllByLabelText('composition-title')[0]).toHaveValue('Перший');

    fireEvent.dragStart(screen.getAllByLabelText('Перемістити')[0]);
    fireEvent.dragOver(screen.getAllByLabelText('Перемістити')[1]);
    fireEvent.dragEnter(screen.getAllByLabelText('Перемістити')[0]);
    fireEvent.dragEnter(screen.getAllByLabelText('Перемістити')[1]);
    fireEvent.dragEnd(screen.getAllByLabelText('Перемістити')[0]);

    const titles = screen.getAllByLabelText('composition-title');
    expect(titles[0]).toHaveValue('Другий');
    expect(titles[1]).toHaveValue('Перший');
  });

  it('removes a composition after delete confirmation', () => {
    const initial: OpusDetailsValue = {
      ...initialOpusDetails,
      compositions: [{ id: 'c1', title: 'Твір для видалення', genre: '', year: '', audios: [], notes: [] }]
    };
    render(<Harness initial={initial} />);

    expect(screen.getByDisplayValue('Твір для видалення')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Видалити' }));

    expect(screen.queryByDisplayValue('Твір для видалення')).not.toBeInTheDocument();
  });

  it('closes the delete dialog via cancel without removing the composition', async () => {
    const initial: OpusDetailsValue = {
      ...initialOpusDetails,
      compositions: [makeComposition('c1', 'Залишити')]
    };
    render(<Harness initial={initial} />);

    fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Скасувати' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByDisplayValue('Залишити')).toBeInTheDocument();
  });

  it('closes the delete dialog via the close icon', async () => {
    const initial: OpusDetailsValue = {
      ...initialOpusDetails,
      compositions: [makeComposition('c1', 'Залишити')]
    };
    render(<Harness initial={initial} />);

    fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Закрити' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByDisplayValue('Залишити')).toBeInTheDocument();
  });

  it('updates dates and datesNote fields', () => {
    render(<Harness />);

    fireEvent.click(screen.getByLabelText('set-Рік створення *'));
    expect(screen.getByLabelText('Рік створення *')).toHaveValue('1999');

    fireEvent.click(screen.getByLabelText('set-Рік закінчення'));
    expect(screen.getByLabelText('Рік закінчення')).toHaveValue('1999');

    const datesNoteField = screen.getByLabelText(OPUS_DETAILS_LABELS.datesNote);
    fireEvent.change(datesNoteField, { target: { value: 'приблизно' } });
    expect(datesNoteField).toHaveValue('приблизно');
  });

  it('closes the composition modal without saving when cancel is clicked', async () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: 'Додати' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Редагувати' })[0]);
    expect(screen.getByText('Редагування композиції')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Скасувати' }));
    await waitFor(() => expect(screen.queryByText('Редагування композиції')).not.toBeInTheDocument());
  });

  it('aborts composition move if source index becomes invalid', () => {
    const initial = {
      ...initialOpusDetails,
      compositions: [makeComposition('c1', 'C1'), makeComposition('c2', 'C2')]
    };
    render(<Harness initial={initial} />);

    const dragHandles = screen.getAllByLabelText('Перемістити');

    fireEvent.dragStart(dragHandles[1]);

    fireEvent.click(screen.getAllByRole('button', { name: 'Видалити' })[1]);
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Видалити' }));
    fireEvent.dragEnter(screen.getAllByLabelText('Перемістити')[0]);

    expect(screen.getAllByLabelText('composition-title')).toHaveLength(1);
    expect(screen.getAllByLabelText('composition-title')[0]).toHaveValue('C1');
  });
});
