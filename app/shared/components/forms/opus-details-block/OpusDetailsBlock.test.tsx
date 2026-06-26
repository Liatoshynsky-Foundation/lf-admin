import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';

import OpusDetailsBlock from './OpusDetailsBlock';
import { initialOpusDetails } from '~/constants/opus';
import type { OpusDetailsErrors, OpusDetailsValue } from '~/types/opus';

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  MediaModal: () => null
}));

jest.mock('./composition-title-input/CompositionTitleInput', () => ({
  __esModule: true,
  default: ({ value, onChangeText }: { value: string; onChangeText: (next: string) => void }) => (
    <input aria-label="composition-title" value={value} onChange={(event) => onChangeText(event.target.value)} />
  )
}));

const Harness = ({
  initial = initialOpusDetails,
  errors = { number: '', name: '', creationYear: '', genre: '' }
}: {
  initial?: OpusDetailsValue;
  errors?: OpusDetailsErrors;
}) => {
  const [value, setValue] = useState<OpusDetailsValue>(initial);

  return <OpusDetailsBlock value={value} onChange={setValue} errors={errors} />;
};

describe('OpusDetailsBlock', () => {
  it('renders the new detail fields', () => {
    render(<Harness />);

    expect(screen.getByLabelText('№ *')).toBeInTheDocument();
    expect(screen.getByLabelText('Назва опусу *')).toBeInTheDocument();
    expect(screen.getByLabelText('Рік створення *')).toBeInTheDocument();
    expect(screen.getByLabelText('Рік закінчення')).toBeInTheDocument();
    expect(screen.getByLabelText('Жанр *')).toBeInTheDocument();
  });

  it('shows validation errors for the required fields', () => {
    render(<Harness errors={{ number: 'Обовʼязкове поле', name: 'Обовʼязкове поле', creationYear: '', genre: '' }} />);

    expect(screen.getAllByText('Обовʼязкове поле')).toHaveLength(2);
  });

  it('updates the opus title field', () => {
    render(<Harness />);

    const nameField = screen.getByLabelText('Назва опусу *');
    fireEvent.change(nameField, { target: { value: 'Соната' } });
    expect(nameField).toHaveValue('Соната');
  });

  it('adds an inline composition row when "Додати" is clicked', () => {
    render(<Harness />);

    expect(screen.queryAllByRole('button', { name: 'Редагувати' })).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: 'Додати' }));

    expect(screen.getAllByRole('button', { name: 'Редагувати' })).toHaveLength(1);
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
});
