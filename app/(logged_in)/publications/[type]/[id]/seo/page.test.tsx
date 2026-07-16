import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { notFound, useParams, useRouter } from 'next/navigation';
import React, { MouseEvent, ReactNode } from 'react';
import toast from 'react-hot-toast';

import PublicatiosSeoPage from './page';
import { CONTENT_MUTATION_RESULTS, PUBLICATIONS_BASE_PATH } from '~/constants/publications';
import { useUpsertPublication } from '~/shared/hooks/use-upsert-publication/useUpsertPublication';
import { BaseContentStatuses } from '~/types/enums/common.enums';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
  notFound: jest.fn()
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

jest.mock('~/shared/hooks/use-upsert-publication/useUpsertPublication', () => ({
  useUpsertPublication: jest.fn()
}));

jest.mock('~/(logged_in)/publications/[type]/create/CreatePublicationsView', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-create-view" />
}));

jest.mock('~/shared/components/divided-header/DividedHeader', () => ({
  __esModule: true,
  default: ({ children, rightActionsComponent }: { children: ReactNode; rightActionsComponent: ReactNode }) => (
    <div>
      {children}
      {rightActionsComponent}
    </div>
  )
}));

jest.mock('~/shared/components/divided-header/header-right-actions/HeaderRightActions', () => ({
  __esModule: true,
  default: ({
    onSave,
    onCancel,
    onPublish,
    onMenuOpen
  }: {
    onSave: () => void;
    onCancel: () => void;
    onPublish?: () => void;
    onMenuOpen?: (e: MouseEvent<HTMLButtonElement>) => void;
    mode: string;
  }) => (
    <>
      <button data-testid="btn-save" onClick={onSave} />
      <button data-testid="btn-cancel" onClick={onCancel} />
      <button data-testid="btn-publish" onClick={onPublish} />
      <button data-testid="btn-open-publish-menu" onClick={(e) => onMenuOpen?.(e)} />
    </>
  )
}));

jest.mock('~/shared/components/divided-header/title-dropdown/TitleDropdown', () => ({
  TitleDropdown: ({ type, title, renderMenuOpen }: { type: string; title: string; renderMenuOpen: boolean }) => (
    <div data-testid="mock-title-dropdown">
      <span data-type={type} data-open={renderMenuOpen} />
      {title}
    </div>
  )
}));

describe('PublicatiosSeoPage Container', () => {
  const mockHandleSave = jest.fn();
  const mockPush = jest.fn();

  const setup = (type = 'news') => {
    (useParams as jest.Mock).mockReturnValue({ type, id: '123' });
    return render(<PublicatiosSeoPage />);
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    mockHandleSave.mockResolvedValue('id');
    (useUpsertPublication as jest.Mock).mockReturnValue({
      handleSave: mockHandleSave
    } as unknown as ReturnType<typeof useUpsertPublication>);
  });

  it('should call notFound() if the type parameter is invalid', () => {
    setup('invalid-type');
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  describe('with valid publication type', () => {
    beforeEach(() => {
      setup('news');
    });

    it('should render successfully with correct SEO title', () => {
      expect(notFound).not.toHaveBeenCalled();
      expect(useUpsertPublication).toHaveBeenCalledWith({ type: 'news', id: '123' });
      expect(screen.getByTestId('mock-create-view')).toBeInTheDocument();
      expect(screen.getByTestId('mock-title-dropdown')).toHaveTextContent('Редагування Новини');
    });

    it('should handle save and cancel actions by routing to base path', async () => {
      fireEvent.click(screen.getByTestId('btn-save'));
      await waitFor(() => {
        expect(mockHandleSave).toHaveBeenCalledTimes(1);
      });
      fireEvent.click(screen.getByTestId('btn-cancel'));
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(2);
        expect(mockPush).toHaveBeenCalledWith(PUBLICATIONS_BASE_PATH);
      });
    });

    it('should show publicationPublished toast when publish is triggered', async () => {
      fireEvent.click(screen.getByTestId('btn-publish'));
      await waitFor(() => {
        expect(mockHandleSave).toHaveBeenCalledWith(BaseContentStatuses.Published);
        expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationPublished);
      });
    });

    it('should show publicationPublished toast and redirect on publish and exit', async () => {
      fireEvent.click(screen.getByTestId('btn-open-publish-menu'));
      fireEvent.click(screen.getByText('Опублікувати і вийти'));

      await waitFor(() => {
        expect(mockHandleSave).toHaveBeenCalledWith(BaseContentStatuses.Published);
        expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationPublished);
        expect(mockPush).toHaveBeenCalledWith(PUBLICATIONS_BASE_PATH);
      });
    });

    it('should NOT show publicationPublished toast with redirect on publish and exit if handleSave doesn\'t return id', async () => {
      mockHandleSave.mockResolvedValue(null);
      fireEvent.click(screen.getByTestId('btn-open-publish-menu'));
      fireEvent.click(screen.getByText('Опублікувати і вийти'));

      await waitFor(() => {
        expect(mockHandleSave).toHaveBeenCalledWith(BaseContentStatuses.Published);
        expect(toast.success).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
      });

    });
    it('should NOT show publicationPublished toast when publish is triggered if handleSave doesn\'t return id', async () => {
      mockHandleSave.mockResolvedValue(null);
      fireEvent.click(screen.getByTestId('btn-publish'));
      await waitFor(() => {
        expect(mockHandleSave).toHaveBeenCalledWith(BaseContentStatuses.Published);
        expect(toast.success).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });
});
