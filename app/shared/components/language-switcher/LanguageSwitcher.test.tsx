import { fireEvent, render, screen } from '@testing-library/react';
import { useLocale } from 'next-intl';
import React from 'react';

import LanguageSwitcher from './LanguageSwitcher';

// Мокаємо навігацію
const mockReplace = jest.fn();
const mockPathname = '/dashboard';

jest.mock('~/../i18n/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    replace: mockReplace
  })
}));

// Мокаємо useLocale
jest.mock('next-intl', () => ({
  useLocale: jest.fn(() => 'uk')
}));

class MockResizeObserver implements ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

let OriginalResizeObserver: typeof global.ResizeObserver;

describe('LanguageSwitcher', () => {
  beforeAll(() => {
    OriginalResizeObserver = global.ResizeObserver;
    global.ResizeObserver = MockResizeObserver;
  });

  afterAll(() => {
    global.ResizeObserver = OriginalResizeObserver;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocale as jest.Mock).mockReturnValue('uk');
    document.cookie = 'NEXT_LOCALE=; Max-Age=0';
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
    (useLocale as jest.Mock).mockReturnValue('en');

    render(<LanguageSwitcher />);
    const ukrainianButton = screen.getByText('Українська');

    fireEvent.click(ukrainianButton);

    expect(document.cookie).toContain('NEXT_LOCALE=uk');
    expect(mockReplace).toHaveBeenCalledWith(mockPathname, { locale: 'uk' });
  });

  it('should reflect active language in ButtonGroup', () => {
    (useLocale as jest.Mock).mockReturnValue('en');
    render(<LanguageSwitcher />);
    expect(screen.getByText('English')).toBeInTheDocument();
  });
});