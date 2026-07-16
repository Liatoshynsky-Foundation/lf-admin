'use client';

import { Box } from '@mui/material';
import { notFound, useParams, useRouter } from 'next/navigation';
import { MouseEvent, useState } from 'react';
import toast from 'react-hot-toast';

import { NavigationMenuItems, PublishMenuItems } from './SeoMenuItems';
import CreatePublicationView from '~/(logged_in)/publications/[type]/create/CreatePublicationsView';
import {
  CONTENT_MUTATION_RESULTS,
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
import { BaseContentStatuses } from '~/types/enums/common.enums';

type Params = {
  type: PublicationsItemType;
  id: string;
};

export default function PublicatiosSeoPage() {
  const { type, id } = useParams<Params>();
  const router = useRouter();

  const publicationData = useUpsertPublication({ type, id });

  const [navigationAnchor, setNavigationAnchor] = useState<HTMLButtonElement | null>(null);
  const [publishAnchor, setPublishAnchor] = useState<HTMLButtonElement | null>(null); // +

  if (!PUBLICATIONS_TYPES.includes(type)) notFound();

  const handleOpenPublish = (event: MouseEvent<HTMLElement>) => {
    setPublishAnchor(event.currentTarget as HTMLButtonElement);
  };
  const handleClosePublish = () => setPublishAnchor(null);

  const handlePublishAndExit = async () => {
    const id = await publicationData?.handleSave(BaseContentStatuses.Published);
    if (id) {
      toast.success(CONTENT_MUTATION_RESULTS.publicationPublished);
      router.push(PUBLICATIONS_BASE_PATH);
    }
  };

  const handlePublish = async () => {
    const id = await publicationData?.handleSave(BaseContentStatuses.Published);
    if (id) toast.success(CONTENT_MUTATION_RESULTS.publicationPublished);
  };

  const handleUnpublish = () => {
    publicationData?.handleSave(BaseContentStatuses.Draft);
    handleClosePublish();
    router.push(PUBLICATIONS_BASE_PATH);
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

  const handleCancel = () => router.push(PUBLICATIONS_BASE_PATH);
  const handleSave = () => {
    publicationData?.handleSave(BaseContentStatuses.Draft);
    router.push(PUBLICATIONS_BASE_PATH);
  };

  const handlePublishExitClick = () => {
    handlePublishAndExit();
    handleClosePublish();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DividedHeader
        originUrl={PUBLICATIONS_BASE_PATH}
        rightActionsComponent={
          <HeaderRightActions
            mode="seo"
            onSave={handleSave}
            onCancel={handleCancel}
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
