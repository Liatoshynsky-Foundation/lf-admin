import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders title, action, and tabs', () => {
    render(
      <PageHeader
        title="Файли"
        activeTab="all"
        action={<button type="button">Дія</button>}
        tabs={[
          { value: 'all', label: 'Всі', href: '/files' },
          { value: 'audio', label: 'Аудіо', href: '/files/audio' }
        ]}
      />
    );

    expect(screen.getByText('Файли')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Дія' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Всі' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Аудіо' })).toHaveAttribute('href', '/files/audio');
  });
  it('should not render tabs is they are not provided', ()=>{
    render(
      <PageHeader
        title="Файли"
        activeTab="all"
        action={<button type="button">Дія</button>}
      />
    );

    expect(screen.getByText('Файли')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Дія' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Всі' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Аудіо' })).not.toBeInTheDocument();
  });

  it('should not select an active tab is it is null', ()=>{
    render(
      <PageHeader
        title="Файли"
        action={<button type="button">Дія</button>}
        tabs={[
          { value: 'all', label: 'Всі', href: '/files' },
          { value: 'audio', label: 'Аудіо', href: '/files/audio' }
        ]}
      />
    );

    expect(screen.getByText('Файли')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Дія' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Всі' })).toHaveAttribute('aria-selected', 'false');
  });

  it('renders disabled tabs without navigation', () => {
    render(
      <PageHeader
        title="Публікації"
        activeTab="all"
        tabs={[
          { value: 'all', label: 'Усі', href: '/publications' },
          { value: 'archived', label: 'Архів', href: '/publications/archived', disabled: true }
        ]}
      />
    );

    expect(screen.getByRole('tab', { name: 'Архів' })).toBeDisabled();
  });
});