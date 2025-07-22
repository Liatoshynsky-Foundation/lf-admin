import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('~/public/icons/trash.svg', () => {
  const TrashIcon = () => <svg data-testid="trash-icon" />;
  TrashIcon.displayName = 'TrashIcon';
  return TrashIcon;
});
import ItemWrapper from './ItemWrapper';

const CHILD_TEXT = 'Test Child';

describe('ItemWrapper', () => {
  it('should render children correctly', () => {
    render(
      <ItemWrapper editable={true} onDelete={jest.fn()}>
        <div>{CHILD_TEXT}</div>
      </ItemWrapper>
    );
    expect(screen.getByText(CHILD_TEXT)).toBeInTheDocument();
  });

  it('should call onDelete when trash icon is clicked', () => {
    const onDelete = jest.fn();
    render(
      <ItemWrapper editable={true} onDelete={onDelete}>
        <div>{CHILD_TEXT}</div>
      </ItemWrapper>
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onDelete).toHaveBeenCalled();
  });

  it('should show trash icon when editable is true', () => {
    render(
      <ItemWrapper editable={true} onDelete={jest.fn()}>
        <div>{CHILD_TEXT}</div>
      </ItemWrapper>
    );
    const button = screen.getByRole('button');
    expect(button).toBeVisible();
  });

  it('should hide trash icon when editable is false', () => {
    render(
      <ItemWrapper editable={false} onDelete={jest.fn()}>
        <div>{CHILD_TEXT}</div>
      </ItemWrapper>
    );
    const button = screen.getByRole('button', { hidden: true });
    expect(button).not.toBeVisible();
  });

  it('should render separator when withSeparator is true (default)', () => {
    render(
      <ItemWrapper editable={true} onDelete={jest.fn()}>
        <div>{CHILD_TEXT}</div>
      </ItemWrapper>
    );
    const separator = screen.getAllByTestId('separator');
    expect(separator.length).toBeGreaterThan(0);
  });

  it('should not render separator when withSeparator is false', () => {
    render(
      <ItemWrapper editable={true} onDelete={jest.fn()} withSeparator={false}>
        <div>{CHILD_TEXT}</div>
      </ItemWrapper>
    );
    const separators = screen.queryAllByTestId('separator');
    expect(separators.length).toBe(0);
  });
});
