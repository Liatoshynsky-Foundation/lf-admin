import { Box, Button, Menu, MenuItem } from '@mui/material';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { notFound, useParams, useRouter } from 'next/navigation';
import React, { MouseEvent, ReactNode } from 'react';
import toast from 'react-hot-toast';

import PublicatiosSeoPage from './page';
import { CONTENT_MUTATION_RESULTS, MENU_ACTION_CONFIGS, PUBLICATIONS_BASE_PATH } from '~/constants/publications';
import { ActionMenuGroups, MenuGroup } from '~/shared/components/dropdown-menu/ActionMenu';
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
    <Box>
      {children}
      {rightActionsComponent}
    </Box>
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
      <Button data-testid="btn-save" onClick={onSave} />
      <Button data-testid="btn-cancel" onClick={onCancel} />
      <Button data-testid="btn-publish" onClick={onPublish} />
      <Button data-testid="btn-open-publish-menu" onClick={(e) => onMenuOpen?.(e)} />
    </>
  )
}));

jest.mock('~/shared/components/divided-header/title-dropdown/TitleDropdown', () => ({
  TitleDropdown: ({
    title,
    onMenuOpen
  }: {
    type: string;
    title: string;
    onMenuOpen?: (e: MouseEvent<HTMLButtonElement>) => void;
  }) => (
    <Box data-testid="mock-title-dropdown">
      <Button data-testid="btn-open-nav-menu" onClick={(e) => onMenuOpen?.(e)}>
        {title}
      </Button>
    </Box>
  )
}));

jest.mock('~/shared/components/dropdown-menu/ActionMenu', () => ({
  __esModule: true,
  default: ({
    anchorEl,
    onClose,
    menuItems
  }: {
    anchorEl: HTMLElement | null;
    onClose: () => void;
    menuItems: ActionMenuGroups;
  }) => (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      {menuItems.flatMap((group: MenuGroup, gIdx) =>
        group.items.map((item, iIdx) => (
          <MenuItem key={`${gIdx}-${iIdx}`} onClick={item.onClick}>
            {item.text.name}
          </MenuItem>
        ))
      )}
    </Menu>
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
    mockHandleSave.mockResolvedValue('123');
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
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
    it.each([
      {
        condition: 'with redirect on publish and exit',
        triggerAction: () => {
          fireEvent.click(screen.getByTestId('btn-open-publish-menu'));
          fireEvent.click(screen.getByText('Опублікувати і вийти'));
        },
      },
      {
        condition: 'when publish is triggered',
        triggerAction: () => {
          fireEvent.click(screen.getByTestId('btn-publish'));
        },
      },
    ])(
      'should NOT show publicationPublished toast $condition if handleSave doesn\'t return id',
      async ({ triggerAction }) => {
        mockHandleSave.mockResolvedValue({ slug: 'some-slug' });
    
        triggerAction();

        await waitFor(() => {
          expect(mockHandleSave).toHaveBeenCalledWith(BaseContentStatuses.Published);
          expect(toast.success).not.toHaveBeenCalled();
          expect(mockPush).not.toHaveBeenCalled();
        });
      }
    );
    it('should handle unpublish action from publication menu', async () => {
      fireEvent.click(screen.getByTestId('btn-open-publish-menu'));
      fireEvent.click(screen.getByText('Скасувати публікацію'));

      await waitFor(() => {
        expect(mockHandleSave).toHaveBeenCalledWith(BaseContentStatuses.Draft);
        expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationUnpublished);
        expect(mockPush).toHaveBeenCalledWith(PUBLICATIONS_BASE_PATH);
      });
    });

    it('should redirect to edit page when editing content from navigation menu', () => {
      fireEvent.click(screen.getByTestId('btn-open-nav-menu'));
      fireEvent.click(screen.getByText('Редагування контенту'));

      expect(mockPush).toHaveBeenCalledWith(`${PUBLICATIONS_BASE_PATH}/news/123/edit`);
    });

    it('should close the navigation menu when handleCloseNavigation is triggered via ActionMenu onClose', () => {
      fireEvent.click(screen.getByTestId('btn-open-nav-menu'));

      expect(screen.getByRole('menu')).toBeInTheDocument();

      const presentation = screen.getByRole('presentation');
      const backdrop = presentation.firstChild as HTMLElement;
      if (backdrop) fireEvent.click(backdrop);

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('when handleSave returns undefined', () => {
    it.each([
      {
        name: 'publish',
        trigger: () => fireEvent.click(screen.getByTestId('btn-publish')),
        status: BaseContentStatuses.Published,
        errorToast: MENU_ACTION_CONFIGS.PUBLISH.toastErrorMessage
      },
      {
        name: 'publish and exit',
        trigger: () => {
          fireEvent.click(screen.getByTestId('btn-open-publish-menu'));
          fireEvent.click(screen.getByText('Опублікувати і вийти'));
        },
        status: BaseContentStatuses.Published,
        errorToast: MENU_ACTION_CONFIGS.PUBLICATE_AND_EXIT.toastErrorMessage
      },
      {
        name: 'cancel publication',
        trigger: () => {
          fireEvent.click(screen.getByTestId('btn-open-publish-menu'));
          fireEvent.click(screen.getByText('Скасувати публікацію'));
        },
        status: BaseContentStatuses.Draft,
        errorToast: MENU_ACTION_CONFIGS.CANCEL_PUBLICATION.toastErrorMessage
      }
    ])(
      'should show toast.error with $errorToast and not redirect on $name',
      async ({ trigger, status, errorToast }) => {
        mockHandleSave.mockResolvedValue(undefined);
        setup('news');
        trigger();

        await waitFor(() => {
          expect(mockHandleSave).toHaveBeenCalledWith(status);
          expect(toast.error).toHaveBeenCalledWith(errorToast);
          expect(mockPush).not.toHaveBeenCalled();
        });
      }
    );
  });

  describe('when publicationData is missing (null/undefined)', () => {
    it('should not throw and should not redirect when data is missing', () => {
      (useUpsertPublication as jest.Mock).mockReturnValue(undefined);
      setup('news');

      fireEvent.click(screen.getByTestId('btn-save'));
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
