import { render, screen } from '@testing-library/react';

import { AuthCardLayout } from './AuthCardLayout';

describe('AuthCardLayout', () => {
  it('renders title, subtitle, and children correctly', () => {
    render(
      <AuthCardLayout title="Тестовий заголовок" subtitle="Тестовий підзаголовок">
        <div data-testid="child-element">Форма</div>
      </AuthCardLayout>
    );

    expect(screen.getByText('Тестовий заголовок')).toBeInTheDocument();
    expect(screen.getByText('Тестовий підзаголовок')).toBeInTheDocument();

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });
});
