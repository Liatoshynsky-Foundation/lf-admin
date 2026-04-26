import { fireEvent, render, screen } from '@testing-library/react';
import { notFound, useParams, useRouter } from 'next/navigation';
import React, { ReactNode } from 'react';

import PublicatiosSeoPage from './page';
import { PUBLICATIONS_BASE_PATH } from '~/constants/publications';
import { useUpsertPublication } from '~/shared/hooks/use-upsert-publication/useUpsertPublication';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
  notFound: jest.fn()
}));

jest.mock('~/shared/hooks/use-upsert-publication/useUpsertPublication', () => ({
  useUpsertPublication: jest.fn()
}));

jest.mock('~/(logged_in)/publications/[type]/create/CreatePublicationsView', () => {
  return function MockCreatePublicationView() {
    return <div data-testid="mock-create-view" />;
  };
});

type MockDividedHeaderProps = {
  children: ReactNode;
  rightActionsComponent: ReactNode;
  originUrl?: string;
};

jest.mock('~/shared/components/divided-header/DividedHeader', () => {
  return function MockDividedHeader({ children, rightActionsComponent }: MockDividedHeaderProps) {
    return (
      <header data-testid="mock-divided-header">
        <div data-testid="header-children">{children}</div>
        <div data-testid="header-actions">{rightActionsComponent}</div>
      </header>
    );
  };
});

type MockHeaderRightActionsProps = {
  onSave: () => void;
  onCancel: () => void;
  mode: string;
};

jest.mock('~/shared/components/divided-header/header-right-actions/HeaderRightActions', () => {
  return function MockHeaderRightActions({ onSave, onCancel, mode }: MockHeaderRightActionsProps) {
    return (
      <div data-testid="mock-header-right-actions">
        <span>Mode: {mode}</span>
        <button data-testid="btn-save" onClick={onSave}>Save</button>
        <button data-testid="btn-cancel" onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

type MockTitleDropdownProps = {
  type: string;
  title: string;
  renderMenuOpen: boolean;
};

jest.mock('~/shared/components/divided-header/title-dropdown/TitleDropdown', () => ({
  TitleDropdown: ({ type, title, renderMenuOpen }: MockTitleDropdownProps) => (
    <div data-testid="mock-title-dropdown">
      {type} - {title} - {renderMenuOpen ? 'Open' : 'Closed'}
    </div>
  )
}));

describe('PublicatiosSeoPage Container', () => {
  const mockHandleSave = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    (useUpsertPublication as jest.Mock).mockReturnValue({
      handleSave: mockHandleSave
    } as unknown as ReturnType<typeof useUpsertPublication>);
  });

  it('should call notFound() if the type parameter is invalid', () => {
    (useParams as jest.Mock).mockReturnValue({ type: 'invalid-type', id: '123' });

    render(<PublicatiosSeoPage />);

    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it('should render the page successfully if the type is valid', () => {
    (useParams as jest.Mock).mockReturnValue({ type: 'news', id: '123' });

    render(<PublicatiosSeoPage />);

    expect(notFound).not.toHaveBeenCalled();

    expect(useUpsertPublication).toHaveBeenCalledWith({ type: 'news', id: '123' });
    expect(screen.getByTestId('mock-create-view')).toBeInTheDocument();
  });

  it('should render the correct SEO title based on the publication type', () => {
    (useParams as jest.Mock).mockReturnValue({ type: 'news', id: '123' });

    render(<PublicatiosSeoPage />);

    const titleDropdown = screen.getByTestId('mock-title-dropdown');
    expect(titleDropdown).toHaveTextContent('SEO - Редагування Новини - Closed');
  });

  it('should navigate to the base path when the cancel button is clicked', () => {
    (useParams as jest.Mock).mockReturnValue({ type: 'news', id: '123' });

    render(<PublicatiosSeoPage />);

    fireEvent.click(screen.getByTestId('btn-cancel'));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(PUBLICATIONS_BASE_PATH);
  });

  it('should call publicationData.handleSave and navigate to the base path when save is clicked', () => {
    (useParams as jest.Mock).mockReturnValue({ type: 'news', id: '123' });

    render(<PublicatiosSeoPage />);

    fireEvent.click(screen.getByTestId('btn-save'));

    expect(mockHandleSave).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(PUBLICATIONS_BASE_PATH);
  });
});
