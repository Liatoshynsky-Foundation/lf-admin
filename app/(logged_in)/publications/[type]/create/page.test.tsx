import { fireEvent,render, screen } from '@testing-library/react';
import { notFound, useParams } from 'next/navigation';
import React, { ReactNode } from 'react';

import CreatePublicationPage from './page';
import { useUpsertPublication } from '~/shared/hooks/use-upsert-publication/useUpsertPublication';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  notFound: jest.fn()
}));

jest.mock('~/shared/hooks/use-upsert-publication/useUpsertPublication', () => ({
  useUpsertPublication: jest.fn()
}));

jest.mock('./CreatePublicationsView', () => {
  return function MockCreatePublicationsView() {
    return <div data-testid="mock-create-view" />;
  };
});

type MockDividedHeaderProps = {
  children: ReactNode;
  rightActionsComponent: ReactNode;
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
  onEdit: () => void;
  mode: string;
};

jest.mock('~/shared/components/divided-header/header-right-actions/HeaderRightActions', () => {
  return function MockHeaderRightActions({ onEdit, mode }: MockHeaderRightActionsProps) {
    return (
      <button data-testid="mock-header-save-btn" onClick={onEdit}>
        {`Save (Mode: ${mode})`}
      </button>
    );
  };
});

describe('CreatePublicationPage Container', () => {
  const mockHandleSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useUpsertPublication as jest.Mock).mockReturnValue({
      handleSave: mockHandleSave
    } as unknown as ReturnType<typeof useUpsertPublication>);
  });

  it('should call notFound() if the type parameter is invalid', () => {
    (useParams as jest.Mock).mockReturnValue({ type: 'invalid-type' });

    render(<CreatePublicationPage />);

    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it('should render the page successfully if the type is valid', () => {
    (useParams as jest.Mock).mockReturnValue({ type: 'news' });

    render(<CreatePublicationPage />);

    expect(notFound).not.toHaveBeenCalled();

    expect(useUpsertPublication).toHaveBeenCalledWith({ type: 'news' });
    expect(screen.getByTestId('mock-create-view')).toBeInTheDocument();
  });

  it('should render the correct page title based on the publication type', () => {
    (useParams as jest.Mock).mockReturnValue({ type: 'events' });

    render(<CreatePublicationPage />);

    expect(screen.getByText('Створення Події')).toBeInTheDocument();
  });

  it('should pass the handleSave function to the HeaderRightActions component', () => {
    (useParams as jest.Mock).mockReturnValue({ type: 'media' });

    render(<CreatePublicationPage />);
    const saveButton = screen.getByTestId('mock-header-save-btn');
    expect(saveButton).toHaveTextContent('Save (Mode: create)');
    fireEvent.click(saveButton);
    expect(mockHandleSave).toHaveBeenCalledTimes(1);
  });
});
