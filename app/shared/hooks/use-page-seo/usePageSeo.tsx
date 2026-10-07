import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

import { TOAST_MESSAGES } from '~/constants';
import { initialSeoValue } from '~/constants/publications';
import {
  mapPageToSeoBlockValue,
  mapSeoBlockValueToUpdatePageSeoInput
} from '~/shared/components/forms/seo-metadata-form/mappers/page.mapper';
import type { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import { useGetPageSeoQuery, useUpdatePageSeoMutation } from '~/types/graphql/generated/graphql';

export const usePageSeo = (slug: string) => {
  const { data, loading } = useGetPageSeoQuery({ variables: { slug } });
  const [updatePageSeo] = useUpdatePageSeoMutation();
  const [seoValue, setSeoValue] = useState<SeoBlockValue>(initialSeoValue);

  const latestSeoRef = useRef(seoValue);

  useEffect(() => {
    latestSeoRef.current = seoValue;
  }, [seoValue]);

  useEffect(() => {
    if (data?.pageBlocks) {
      setSeoValue(mapPageToSeoBlockValue(data.pageBlocks));
    }
  }, [data]);

  const handleSave = async () => {
    try {
      const input = mapSeoBlockValueToUpdatePageSeoInput(slug, latestSeoRef.current);

      await updatePageSeo({
        variables: { input },
        refetchQueries: ['GetPageSeo']
      });

      toast.success(TOAST_MESSAGES.SEO_SAVED);
    } catch {
      toast.error(TOAST_MESSAGES.PAGE_UPDATE_FAILED);
    }
  };

  return { seoValue, setSeoValue, loading, handleSave };
};
