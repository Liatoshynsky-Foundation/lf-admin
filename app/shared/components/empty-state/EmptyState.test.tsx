import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="Файли відсутні" description="Файли для цієї вкладки поки відсутні." />);

    expect(screen.getByText('Файли відсутні')).toBeInTheDocument();
    expect(screen.getByText('Файли для цієї вкладки поки відсутні.')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <EmptyState
        title="Немає обраних"
        description="Опис"
        icon={<svg data-testid="star-icon" />}
      />
    );

    expect(screen.getByTestId('star-icon')).toBeInTheDocument();
  });

  it('does not render icon when not provided', () => {
    const { container } = render(<EmptyState title="Заголовок" description="Опис" />);

    expect(container.querySelectorAll('svg')).toHaveLength(0);
  });

  it('renders action button with text', () => {
    render(
      <EmptyState
        title="Заголовок"
        description="Опис"
        action={{ label: 'Переглянути всі файли', href: '/files' }}
      />
    );

    const button = screen.getByRole('link', { name: 'Переглянути всі файли' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', '/files');
  });

  it('calls onClick when action button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <EmptyState
        title="Заголовок"
        description="Опис"
        action={{ label: 'Натисни', onClick }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Натисни' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when not provided', () => {
    render(<EmptyState title="Заголовок" description="Опис" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('applies data-testid when provided', () => {
    render(<EmptyState title="Заголовок" description="Опис" dataTestId="my-empty-state" />);

    expect(screen.getByTestId('my-empty-state')).toBeInTheDocument();
  });
});
