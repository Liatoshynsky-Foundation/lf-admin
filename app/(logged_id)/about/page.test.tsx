import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import About from './page';

// 🔹 Моки для дочірніх компонентів
jest.mock('~/shared/components/header/Header', () => ({
  Header: ({ title }: { title: string }) => <div data-testid="header">{title}</div>
}));

jest.mock('~/shared/components/about-us/Entry-section/EntrySection', () => ({
  EntrySection: () => <div data-testid="entry-section">EntrySection</div>
}));

jest.mock('~/shared/components/about-us/Liatoshynsky-foundation/LiatoshynskyFoundation', () => ({
  LiatoshynskyFoundation: () => <div data-testid="foundation">LiatoshynskyFoundation</div>
}));

jest.mock('~/shared/components/about-us/our-mission/OurMission', () => ({
  __esModule: true,
  default: () => <div data-testid="our-mission">OurMission</div>
}));

jest.mock('~/shared/components/about-us/Liatoshynsky-office/Liatoshynsky-office', () => ({
  LiatoshynskyOffice: () => <div data-testid="office">LiatoshynskyOffice</div>
}));

const setLocaleMock = jest.fn();
jest.mock('~/store', () => ({
  useStore: (selector: (state: { setLocale: typeof setLocaleMock }) => unknown) =>
    selector({ setLocale: setLocaleMock })
}));

describe('About Page', () => {
  it('renders the About page with all child components', () => {
    render(<About />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('entry-section')).toBeInTheDocument();
    expect(screen.getByTestId('foundation')).toBeInTheDocument();
    expect(screen.getByTestId('our-mission')).toBeInTheDocument();
    expect(screen.getByTestId('office')).toBeInTheDocument();
  });
});
