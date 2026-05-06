'use client';

import { Box } from '@mui/material';
import { notFound, useParams, useRouter } from 'next/navigation';

import CreatePublicationView from '~/(logged_in)/publications/[type]/create/CreatePublicationsView';
import {
  PAGE_TITLES,
  PUBLICATIONS_BASE_PATH,
  PUBLICATIONS_TYPES,
  PublicationsItemType
} from '~/constants/publications';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import { TitleDropdown } from '~/shared/components/divided-header/title-dropdown/TitleDropdown';
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

  if (!PUBLICATIONS_TYPES.includes(type)) notFound();

  const handleCancel = () => router.push(PUBLICATIONS_BASE_PATH);
  const handleSave = () => {
    publicationData?.handleSave(BaseContentStatuses.Draft);
    router.push(PUBLICATIONS_BASE_PATH);
  };

  return (
    <Box>
      <DividedHeader
        originUrl={PUBLICATIONS_BASE_PATH}
        rightActionsComponent={<HeaderRightActions mode="seo" onSave={handleSave} onCancel={handleCancel} />}
      >
        <TitleDropdown type="SEO" title={`Редагування ${PAGE_TITLES[type]}`} renderMenuOpen={false} />
      </DividedHeader>

      <CreatePublicationView data={publicationData}  showHeader={false} />
    </Box>
  );
}
