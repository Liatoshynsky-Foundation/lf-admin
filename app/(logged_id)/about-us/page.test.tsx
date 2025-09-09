import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import About from './page';

const saveMock = jest.fn();
const setLocaleMock = jest.fn();

jest.mock('~/shared/components/header/Header', () => ({
  Header: ({
    title,
    onSave,
    isSaving,
    onLanguageChange
  }: {
    title: string;
    onSave: () => void;
    isSaving: boolean;
    onLanguageChange: (lang: 'uk' | 'en') => void;
  }) => (
    <div data-testid="header">
      {title}
      <button data-testid="save-btn" onClick={onSave}>
        save
      </button>
      <span data-testid="saving-flag">{String(isSaving)}</span>
      <button data-testid="lang-en" onClick={() => onLanguageChange('en')}>
        set-en
      </button>
    </div>
  )
}));

jest.mock('~/shared/components/about-us/Intro-section/IntroSection', () => ({
  IntroSection: () => <div data-testid="intro-section">IntroSection</div>
}));

jest.mock('~/shared/components/about-us/Liatoshynsky-foundation/LiatoshynskyFoundation', () => ({
  LiatoshynskyFoundation: () => <div data-testid="foundation">LiatoshynskyFoundation</div>
}));

jest.mock('~/shared/components/about-us/our-mission/OurMission', () => ({
  __esModule: true,
  default: () => <div data-testid="our-mission">OurMission</div>
}));

jest.mock('~/shared/components/about-us/our-goals/OurGoals', () => ({
  __esModule: true,
  default: () => <div data-testid="our-goals">OurGoals</div>
}));

jest.mock('~/shared/components/about-us/Liatoshynsky-office/Liatoshynsky-office', () => ({
  LiatoshynskyOffice: () => <div data-testid="office">LiatoshynskyOffice</div>
}));

jest.mock('~/shared/components/about-us/what-we-do/WhatWeDo', () => ({
  __esModule: true,
  default: () => <div data-testid="what-we-do">WhatWeDo</div>
}));

jest.mock('~/store', () => ({
  useStore: (selector: (state: { setLocale: typeof setLocaleMock }) => unknown) =>
    selector({ setLocale: setLocaleMock })
}));

jest.mock('~/shared/hooks/use-save-page/UseSavePage', () => ({
  useSavePageBlocks: () => ({
    save: saveMock,
    loading: false
  })
}));

describe('About Page', () => {
  beforeEach(() => {
    saveMock.mockClear();
    setLocaleMock.mockClear();
  });

  it('should render the About page with all child components', () => {
    render(<About />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('intro-section')).toBeInTheDocument();
    expect(screen.getByTestId('foundation')).toBeInTheDocument();
    expect(screen.getByTestId('our-mission')).toBeInTheDocument();
    expect(screen.getByTestId('our-goals')).toBeInTheDocument();
    expect(screen.getByTestId('office')).toBeInTheDocument();
    expect(screen.getByTestId('what-we-do')).toBeInTheDocument();
  });

  it('should call save function when save button is clicked', () => {
    render(<About />);
    fireEvent.click(screen.getByTestId('save-btn'));
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it('should display saving flag from hook', () => {
    render(<About />);
    expect(screen.getByTestId('saving-flag')).toHaveTextContent('false');
  });

  it('should call setLocale when language button is clicked', () => {
    render(<About />);
    fireEvent.click(screen.getByTestId('lang-en'));
    expect(setLocaleMock).toHaveBeenCalledWith('en');
  });
});
