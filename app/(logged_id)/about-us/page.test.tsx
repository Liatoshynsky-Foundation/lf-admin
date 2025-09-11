// app/(pages)/about/page.test.tsx
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import Page from './page';
import { PAGE_IDS } from '~/constants/pageBlocks';

const publishMock = jest.fn();
const previewMock = jest.fn();
const setLocaleMock = jest.fn();
const discardChangesMock = jest.fn();

jest.mock('~/shared/components/header/Header', () => ({
  Header: ({
    title,
    onPreview,
    onSave,
    onCancel,
    isSaving,
    onLanguageChange
  }: {
    title: string;
    onPreview: () => void;
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
    onLanguageChange: (lang: 'uk' | 'en') => void;
  }) => (
    <div data-testid="header">
      <span data-testid="title">{title}</span>
      <button data-testid="preview-btn" onClick={onPreview}>
        preview
      </button>
      <button data-testid="save-btn" onClick={onSave}>
        save
      </button>
      <button data-testid="cancel-btn" onClick={onCancel}>
        cancel
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
  useStore: (
    selector: (state: { setLocale: (l: 'uk' | 'en') => void; discardChanges: (slug: string) => void }) => unknown
  ) =>
    selector({
      setLocale: setLocaleMock,
      discardChanges: discardChangesMock
    })
}));

jest.mock('~/shared/hooks/use-page-editor/usePageEditor', () => ({
  usePageEditor: jest.fn((_slug: string) => ({
    publish: publishMock,
    preview: previewMock,
    loading: false
  }))
}));

describe('About Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the About page with all child components', () => {
    render(<Page />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('intro-section')).toBeInTheDocument();
    expect(screen.getByTestId('foundation')).toBeInTheDocument();
    expect(screen.getByTestId('our-mission')).toBeInTheDocument();
    expect(screen.getByTestId('our-goals')).toBeInTheDocument();
    expect(screen.getByTestId('office')).toBeInTheDocument();
    expect(screen.getByTestId('what-we-do')).toBeInTheDocument();
  });

  it('should call publish when save button is clicked', () => {
    render(<Page />);
    fireEvent.click(screen.getByTestId('save-btn'));
    expect(publishMock).toHaveBeenCalledTimes(1);
  });

  it('should call preview when preview button is clicked', () => {
    render(<Page />);
    fireEvent.click(screen.getByTestId('preview-btn'));
    expect(previewMock).toHaveBeenCalledTimes(1);
  });

  it('should display saving flag from hook (false by default)', () => {
    render(<Page />);
    expect(screen.getByTestId('saving-flag')).toHaveTextContent('false');
  });

  it('should display saving flag = true when hook loading is true', () => {
    const { usePageEditor } = jest.requireMock('~/shared/hooks/use-page-editor/usePageEditor') as {
      usePageEditor: jest.Mock;
    };
    usePageEditor.mockImplementationOnce((_slug: string) => ({
      publish: publishMock,
      preview: previewMock,
      loading: true
    }));
    render(<Page />);
    expect(screen.getByTestId('saving-flag')).toHaveTextContent('true');
  });

  it('should call setLocale when language button is clicked', () => {
    render(<Page />);
    fireEvent.click(screen.getByTestId('lang-en'));
    expect(setLocaleMock).toHaveBeenCalledWith('en');
  });

  it('should call discardChanges with page slug when cancel button is clicked', () => {
    render(<Page />);
    fireEvent.click(screen.getByTestId('cancel-btn'));
    expect(discardChangesMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US);
  });

  it('should call usePageEditor with ABOUT_US page id', () => {
    const { usePageEditor } = jest.requireMock('~/shared/hooks/use-page-editor/usePageEditor') as {
      usePageEditor: jest.Mock;
    };
    render(<Page />);
    expect(usePageEditor).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US);
  });
});
