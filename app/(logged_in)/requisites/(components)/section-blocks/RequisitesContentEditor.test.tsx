import { fireEvent, render, screen } from '@testing-library/react';

import { RequisitesContentEditor } from './RequisitesContentEditor';

jest.mock('~/shared/components/custom-formatting-field/CustomFormattingField', () => ({
  __esModule: true,
  CustomFormattingField: ({
    label,
    onChange
  }: {
    label?: string;
    value?: unknown;
    onChange: (value: unknown) => void;
  }) => (
    <div data-testid="custom-formatting-field">
      <span>{label}</span>
      <button
        onClick={() =>
          onChange({
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Details' }] }]
          })
        }
      >
        Change Content
      </button>
    </div>
  )
}));

describe('RequisitesContentEditor', () => {
  it('renders CustomFormattingField with label', () => {
    const handleChange = jest.fn();
    render(
      <RequisitesContentEditor
        value={{ type: 'doc', content: [{ type: 'paragraph' }] }}
        onChange={handleChange}
      />
    );

    expect(screen.getByTestId('custom-formatting-field')).toBeInTheDocument();
    expect(screen.getByText('Текст реквізитів')).toBeInTheDocument();
  });

  it('calls onChange with TipTap doc when changed', () => {
    const handleChange = jest.fn();
    render(
      <RequisitesContentEditor
        value={{ type: 'doc', content: [{ type: 'paragraph' }] }}
        onChange={handleChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Change Content' }));

    expect(handleChange).toHaveBeenCalledWith({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Details' }] }]
    });
  });
});
