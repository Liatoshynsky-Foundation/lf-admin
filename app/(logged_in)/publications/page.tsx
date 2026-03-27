import { Box } from '@mui/material';

import SeoMetadataBlock from '~/shared/components/forms/seo-metadata-form/SeoMetadataBlock';

export default function PublicationsPage() {
  return (
    <Box>
      <SeoMetadataBlock showCanonicalUrl={true} showAlternativeText={true} />
    </Box>
  );
}
