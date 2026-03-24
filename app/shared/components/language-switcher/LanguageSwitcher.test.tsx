import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import LanguageSwitcher from './LanguageSwitcher';

const mockReplace = jest.fn();
const mockPathname = '/dashboard';

// Створюємо мок-функцію заздалегідь
const mockUseLocale = jest.fn();

jest.mock('~/../i18n/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    replace: mockReplace
  })
}));

// Використовуємо створену мок-функцію тут
jest.mock('next-intl', () => ({
  useLocale: () => mockUseLocale()
}));

class MockResizeObserver {
  observe() { return; }
  unobserve() { return; }
  disconnect() { return; }
}

let tempResizeObserver: typeof global.ResizeObserver;

describe('LanguageSwitcher', () => {
  beforeAll(() => {
    tempResizeObserver = global.ResizeObserver;
    global.ResizeObserver = MockResizeObserver;
  });

  afterAll(() => {
    global.ResizeObserver = tempResizeObserver;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = 'NEXT_LOCALE=; Max-Age=0';
    // Встановлюємо значення за замовчуванням перед кожним тестом
    mockUseLocale.mockReturnValue('uk');
  });

  it('should render language buttons', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText('Українська')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('should set NEXT_LOCALE cookie and call router.replace when "English" is clicked', () => {
    render(<LanguageSwitcher />);
    const englishButton = screen.getByText('English');

    fireEvent.click(englishButton);

    expect(document.cookie).toContain('NEXT_LOCALE=en');
    expect(mockReplace).toHaveBeenCalledWith(mockPathname, { locale: 'en' });
  });

  it('should set NEXT_LOCALE cookie and call router.replace when "Українська" is clicked', () => {
    // Тепер це працює, бо ми викликаємо mockReturnValue на jest.fn()
    mockUseLocale.mockReturnValue('en');

    render(<LanguageSwitcher />);
    const ukrainianButton = screen.getByText('Українська');

    fireEvent.click(ukrainianButton);

    expect(document.cookie).toContain('NEXT_LOCALE=uk');
    expect(mockReplace).toHaveBeenCalledWith(mockPathname, { locale: 'uk' });
  });

  it('should reflect active language in ButtonGroup', () => {
    mockUseLocale.mockReturnValue('en');

    render(<LanguageSwitcher />);

    expect(screen.getByText('English')).toBeInTheDocument();
  });
});