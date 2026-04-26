'use client';

import { Box } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';

import CreatePublicationView from '~/(logged_in)/publications/[type]/create/CreatePublicationsView';
import { PAGE_TITLES, PUBLICATIONS_BASE_PATH, PublicationsItemType } from '~/constants/publications';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import { TitleDropdown } from '~/shared/components/divided-header/title-dropdown/TitleDropdown';
import { useUpsertPublication } from '~/shared/hooks/use-upsert-publication/useUpsertPublication';

type Params = {
  type: PublicationsItemType;
  id: string;
};

export default function PublicatiosSeoPage() {
  const { type, id } = useParams<Params>();
  const router = useRouter();

  const publicationData = useUpsertPublication({ type, id });

  const handleCancel = () => router.push(PUBLICATIONS_BASE_PATH);
  const handleSave = () => {
    publicationData?.handleSave();
    router.push(PUBLICATIONS_BASE_PATH);
  };

  return (
    <Box>
      <DividedHeader
        rightActionsComponent={<HeaderRightActions mode="seo" onSave={handleSave} onCancel={handleCancel} />}
      >
        <TitleDropdown type="SEO" title={`Редагування ${PAGE_TITLES[type]}`} renderMenuOpen={false} />
      </DividedHeader>

      <CreatePublicationView data={publicationData} />
    </Box>
  );
}
