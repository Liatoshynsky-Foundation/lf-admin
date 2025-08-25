import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import LanguageSwitcher from './LanguageSwitcher';

class MockResizeObserver {
  observe() {
    return;
  }
  unobserve() {
    return;
  }
  disconnect() {
    return;
  }
}

let tempResizeObserver: typeof global.ResizeObserver;

describe('LanguageSwitcher', () => {
  const mockLanguageSwitcher = jest.fn();
  beforeAll(() => {
    tempResizeObserver = global.ResizeObserver;
    global.ResizeObserver = MockResizeObserver;
  });

  afterAll(() => {
    global.ResizeObserver = tempResizeObserver;
  });

  beforeEach(() => {
    mockLanguageSwitcher.mockClear();
  });

  it('should render language buttons', () => {
    render(<LanguageSwitcher languageSwitcher={mockLanguageSwitcher} />);
    expect(screen.getByText('Українська')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('should call languageSwitcher with "ua" when Українська is clicked', () => {
    render(<LanguageSwitcher languageSwitcher={mockLanguageSwitcher} />);
    const ukrainianButton = screen.getByText('Українська');
    fireEvent.click(ukrainianButton);
    expect(mockLanguageSwitcher).toHaveBeenCalledWith('uk');
  });

  it('should call languageSwitcher with "en" when English is clicked', () => {
    render(<LanguageSwitcher languageSwitcher={mockLanguageSwitcher} />);
    const englishButton = screen.getByText('English');
    fireEvent.click(englishButton);
    expect(mockLanguageSwitcher).toHaveBeenCalledWith('en');
  });

  it('should render the default active button', () => {
    render(<LanguageSwitcher languageSwitcher={mockLanguageSwitcher} />);
    const ukrainianButton = screen.getByText('Українська');
    expect(ukrainianButton).toBeInTheDocument();
  });
});
