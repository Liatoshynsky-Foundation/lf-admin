import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FondDetailsBlock, { FondDetailsErrors, FondDetailsValue } from './FondDetailsBlock';

const mockUseStore = jest.fn();
jest.mock('~/store', () => ({
  __esModule: true,
  useStore: (selector: (state: { locale: string }) => unknown) => mockUseStore(selector)
}));

jest.mock('~/shared/components/custom-formatting-field/CustomFormattingField', () => ({
  __esModule: true,
  CustomFormattingField: ({ label, onChange, error, helperText }: {
    label: string;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: boolean;
    helperText?: string;
  }) => (
    <div data-testid="custom-formatting-field">
      <span>{label}</span>
      <span data-testid="cff-error">{String(error)}</span>
      <span data-testid="cff-helper">{helperText}</span>
      <button onClick={() => onChange({ type: 'doc', content: [{ type: 'text', text: 'x' }] })}>
        change description
      </button>
    </div>
  )
}));

const baseValue: FondDetailsValue = {
  fondNumber: '10',
  name: { uk: 'Назва', en: 'Name' },
  documentCreationDate: '1900',
  chronologicalBoundaries: '1900-1950',
  organizationForm: { uk: 'Форма', en: 'Form' },
  description: { uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } },
  casesCount: 3,
  descriptionsCount: 5
};

const setup = (overrides: Partial<{
  value: FondDetailsValue;
  errors: FondDetailsErrors;
  forceShowErrors: boolean;
  locale: string;
}> = {}) => {
  mockUseStore.mockImplementation((selector: (state: { locale: string }) => unknown) =>
    selector({ locale: overrides.locale ?? 'uk' })
  );

  const onChange = jest.fn();
  render(
    <FondDetailsBlock
      value={overrides.value ?? baseValue}
      onChange={onChange}
      errors={overrides.errors ?? {}}
      forceShowErrors={overrides.forceShowErrors}
    />
  );
  return { onChange };
};

describe('FondDetailsBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the read-only counters and all editable fields with current values', () => {
    setup();

    expect(screen.getByLabelText('Кількість описів')).toHaveValue('5');
    expect(screen.getByLabelText('Кількість справ')).toHaveValue('3');
    expect(screen.getByLabelText('Номер Фонду *')).toHaveValue('10');
    expect(screen.getByLabelText('Назва фонду *')).toHaveValue('Назва');
    expect(screen.getByLabelText('Дата утворення документів *')).toHaveValue('1900');
    expect(screen.getByLabelText('Хронологічні межі *')).toHaveValue('1900-1950');
    expect(screen.getByLabelText('Форма упорядкування:')).toHaveValue('Форма');
  });

  it('renders the english locale values when locale is en', () => {
    setup({ locale: 'en' });

    expect(screen.getByLabelText('Назва фонду *')).toHaveValue('Name');
    expect(screen.getByLabelText('Форма упорядкування:')).toHaveValue('Form');
  });

  it('calls onChange with an updater that sets fondNumber', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();

    await user.type(screen.getByLabelText('Номер Фонду *'), '1');

    expect(onChange).toHaveBeenCalled();
    const updater = onChange.mock.calls[0][0] as (prev: FondDetailsValue) => FondDetailsValue;
    expect(updater(baseValue).fondNumber).not.toBe(baseValue.fondNumber);
  });

  it('calls onChange with an updater that merges the localized name', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();

    await user.type(screen.getByLabelText('Назва фонду *'), 'X');

    const updater = onChange.mock.calls[0][0] as (prev: FondDetailsValue) => FondDetailsValue;
    const updated = updater(baseValue);
    expect(updated.name.en).toBe(baseValue.name.en);
    expect(updated.name.uk).not.toBe(baseValue.name.uk);
  });

  it('calls onChange with an updater that merges the localized organizationForm', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();

    await user.type(screen.getByLabelText('Форма упорядкування:'), 'X');

    const updater = onChange.mock.calls[0][0] as (prev: FondDetailsValue) => FondDetailsValue;
    const updated = updater(baseValue);
    expect(updated.organizationForm.en).toBe(baseValue.organizationForm.en);
    expect(updated.organizationForm.uk).not.toBe(baseValue.organizationForm.uk);
  });

  it('calls onChange with an updater that merges the localized description on rich text change', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();

    await user.click(screen.getByText('change description'));

    const updater = onChange.mock.calls[0][0] as (prev: FondDetailsValue) => FondDetailsValue;
    const updated = updater(baseValue);
    expect(updated.description.uk).toEqual({ type: 'doc', content: [{ type: 'text', text: 'x' }] });
    expect(updated.description.en).toBe(baseValue.description.en);
  });

  it('does not show error state or helper text when forceShowErrors is false', () => {
    setup({ errors: { name: 'Назва є обов’язковою.' }, forceShowErrors: false });

    expect(screen.getByLabelText('Назва фонду *')).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('shows error state and helper text on all invalid fields when forceShowErrors is true', () => {
    setup({
      errors: {
        fondNumber: 'err-number',
        name: 'err-name',
        documentCreationDate: 'err-date',
        chronologicalBoundaries: 'err-chrono',
        organizationForm: 'err-org',
        description: 'err-desc'
      },
      forceShowErrors: true
    });

    expect(screen.getByLabelText('Номер Фонду *')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('err-number')).toBeInTheDocument();
    expect(screen.getByLabelText('Назва фонду *')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('err-name')).toBeInTheDocument();
    expect(screen.getByLabelText('Дата утворення документів *')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('err-date')).toBeInTheDocument();
    expect(screen.getByLabelText('Хронологічні межі *')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('err-chrono')).toBeInTheDocument();
    expect(screen.getByLabelText('Форма упорядкування:')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('err-org')).toBeInTheDocument();
    expect(screen.getByTestId('cff-error')).toHaveTextContent('true');
    expect(screen.getByTestId('cff-helper')).toHaveTextContent('err-desc');
  });

  it('calls onChange with an updater that sets documentCreationDate', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();

    await user.type(screen.getByLabelText('Дата утворення документів *'), '1918');

    expect(onChange).toHaveBeenCalled();
    const updater = onChange.mock.calls[0][0] as (prev: FondDetailsValue) => FondDetailsValue;
    expect(updater(baseValue).documentCreationDate).not.toBe(baseValue.documentCreationDate);
  });

  it('calls onChange with an updater that sets chronologicalBoundaries', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();

    await user.type(screen.getByLabelText('Хронологічні межі *'), '1920');

    expect(onChange).toHaveBeenCalled();
    const updater = onChange.mock.calls[0][0] as (prev: FondDetailsValue) => FondDetailsValue;
    expect(updater(baseValue).chronologicalBoundaries).not.toBe(baseValue.chronologicalBoundaries);
  });

  it('renders empty string fallbacks for localized fields when their values are missing', () => {
    setup({
      value: {
        ...baseValue,
        name: {
          uk: '',
          en: ''
        }, 
        organizationForm: {
          uk: '',
          en: ''
        },
      }
    });

    expect(screen.getByLabelText('Назва фонду *')).toHaveValue('');
    expect(screen.getByLabelText('Форма упорядкування:')).toHaveValue('');
  });
});