'use client';

import { Box } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';

import { styles } from './page.style';
import { MAIN_PAGE_BASE_PATH } from '~/constants/pages';
import DividedHeader from '~/shared/components/divided-header/DividedHeader';
import HeaderRightActions from '~/shared/components/divided-header/header-right-actions/HeaderRightActions';
import { TitleDropdown } from '~/shared/components/divided-header/title-dropdown/TitleDropdown';
import SeoMetadataBlock from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import { usePageSeo } from '~/shared/hooks/use-page-seo/usePageSeo';

export default function PageSeoPage() {
  const { slug } = useParams();
  const router = useRouter();

  const { seoValue, setSeoValue, handleSave, pageExtraFields, loading } = usePageSeo(slug as string);

  const handleCancel = () => {
    router.push(MAIN_PAGE_BASE_PATH);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DividedHeader
        originUrl={MAIN_PAGE_BASE_PATH}
        rightActionsComponent={
          <HeaderRightActions
            mode="seo"
            onSave={handleSave}
            onCancel={handleCancel}
            onPublish={handleSave}
            isPageSeo
            disabled={loading}
          />
        }
      >
        <TitleDropdown type="SEO" title={`${seoValue.meta.uk.title}`} renderMenuOpen={true} />
      </DividedHeader>

      <Box sx={styles.contentWrapperSeo}>
        <SeoMetadataBlock
          value={seoValue}
          extraFieldsBeforeKeywords
          onChange={setSeoValue}
          extraFields={pageExtraFields}
        />
      </Box>
    </Box>
  );
}
