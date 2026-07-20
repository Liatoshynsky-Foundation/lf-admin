'use client';

import { Box } from '@mui/material';
import { notFound, useParams, useRouter } from 'next/navigation';
import { MouseEvent, useState } from 'react';
import toast from 'react-hot-toast';

import { NavigationMenuItems, PublishMenuItems } from './SeoMenuItems';
import CreatePublicationView from '~/(logged_in)/publications/[type]/create/CreatePublicationsView';
import {
  MENU_ACTION_CONFIGS,
  PAGE_TITLES,
  PUBLICATIONS_BASE_PATH,
  PUBLICATIONS_TYPES,
  PublicationsItemType
} from '~/constants/publications';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import { TitleDropdown } from '~/shared/components/divided-header/title-dropdown/TitleDropdown';
import ActionMenu from '~/shared/components/dropdown-menu/ActionMenu';
import { useUpsertPublication } from '~/shared/hooks/use-upsert-publication/useUpsertPublication';

type Params = {
  type: PublicationsItemType;
  id: string;
};

export default function PublicatiosSeoPage() {
  const { type, id } = useParams<Params>();
  const router = useRouter();

  const publicationData = useUpsertPublication({ type, id });

  const [navigationAnchor, setNavigationAnchor] = useState<HTMLButtonElement | null>(null);
  const [publishAnchor, setPublishAnchor] = useState<HTMLButtonElement | null>(null);

  if (!PUBLICATIONS_TYPES.includes(type)) notFound();

  const handleOpenPublish = (event: MouseEvent<HTMLElement>) => {
    setPublishAnchor(event.currentTarget as HTMLButtonElement);
  };
  const handleClosePublish = () => setPublishAnchor(null);

  const handlePublishAndExit = async () => {
    const { status, toastMessage, toastErrorMessage } = MENU_ACTION_CONFIGS.PUBLICATE_AND_EXIT;
    const id = await publicationData?.handleSave(status);
    if (id) {
      toast.success(toastMessage);
      router.push(PUBLICATIONS_BASE_PATH);
    } else {
      toast.error(toastErrorMessage);
    }
  };

  const handlePublish = async () => {
    const { status, toastMessage, toastErrorMessage } = MENU_ACTION_CONFIGS.PUBLISH;
    const id = await publicationData?.handleSave(status);
    if (id) {
      toast.success(toastMessage);
    } else {
      toast.error(toastErrorMessage);
    }
  };

  const handleUnpublish = async () => {
    const { status, toastMessage, toastErrorMessage } = MENU_ACTION_CONFIGS.CANCEL_PUBLICATION;
    const id = await publicationData?.handleSave(status);
    if (id) {
      handleClosePublish();
      toast.success(toastMessage);
      router.push(PUBLICATIONS_BASE_PATH);
    } else {
      toast.error(toastErrorMessage);
    }
  };

  const handleOpenNavigation = (event: MouseEvent<HTMLElement>) => {
    setNavigationAnchor(event.currentTarget as HTMLButtonElement);
  };

  const handleCloseNavigation = () => {
    setNavigationAnchor(null);
  };

  const handleEditClick = () => {
    router.push(`${PUBLICATIONS_BASE_PATH}/${type}/${id}/edit`);
  };

  const handlePublishExitClick = async () => {
    await handlePublishAndExit();
    handleClosePublish();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DividedHeader
        originUrl={PUBLICATIONS_BASE_PATH}
        rightActionsComponent={
          <HeaderRightActions
            mode="seo"
            onPublish={handlePublish}
            onMenuOpen={handleOpenPublish}
          />
        }
      >
        <TitleDropdown
          type="SEO"
          title={`Редагування ${PAGE_TITLES[type]}`}
          renderMenuOpen={true}
          onMenuOpen={handleOpenNavigation}
        />
      </DividedHeader>

      <ActionMenu
        anchorEl={navigationAnchor}
        onClose={handleCloseNavigation}
        menuItems={NavigationMenuItems({
          handleEditClick
        })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      />

      <ActionMenu
        anchorEl={publishAnchor}
        onClose={handleClosePublish}
        menuItems={PublishMenuItems({
          handlePublishExitClick,
          handleUnpublish
        })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      />

      <CreatePublicationView data={publicationData} mode="seo" />
    </Box>
  );
}
