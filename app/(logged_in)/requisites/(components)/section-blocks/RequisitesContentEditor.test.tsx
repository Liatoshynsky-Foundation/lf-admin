import { fireEvent, render, screen } from '@testing-library/react';

import { RequisitesContentEditor } from './RequisitesContentEditor';

jest.mock('~/shared/components/custom-formatting-field/CustomFormattingField', () => ({
  __esModule: true,
  CustomFormattingField: ({
    label,
    onChange,
    editable = true
  }: {
    label?: string;
    value?: unknown;
    onChange: (value: unknown) => void;
    editable?: boolean;
  }) => (
    <div data-testid="custom-formatting-field" data-editable={String(editable)}>
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

  it('passes editable={false} to CustomFormattingField when readOnly is true', () => {
    render(
      <RequisitesContentEditor
        value={{ type: 'doc', content: [{ type: 'paragraph' }] }}
        onChange={jest.fn()}
        readOnly
      />
    );

    expect(screen.getByTestId('custom-formatting-field')).toHaveAttribute('data-editable', 'false');
  });
});
