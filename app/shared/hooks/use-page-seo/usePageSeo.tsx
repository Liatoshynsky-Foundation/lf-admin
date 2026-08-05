import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

import { initialSeoValue } from '~/constants/publications';
import {
  mapPageToSeoBlockValue,
  mapSeoBlockValueToUpdatePageSeoInput
} from '~/shared/components/forms/seo-metadata-form/mappers/page.mapper';
import { SeoCanonicalUrlField } from '~/shared/components/forms/seo-metadata-form/seo-canonicalurl-field/SeoCanonicalUrlField';
import type { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import { LocalizedMeta } from '~/shared/components/forms/seo-metadata-form/SeoMetadataForm';
import { useGetPageSeoQuery, useUpdatePageSeoMutation } from '~/types/graphql/generated/graphql';

export const usePageSeo = (slug: string) => {
  const { data, loading } = useGetPageSeoQuery({ variables: { slug } });
  const [updatePageSeo] = useUpdatePageSeoMutation();
  const [seoValue, setSeoValue] = useState<SeoBlockValue>(initialSeoValue);

  const latestSeoRef = useRef(seoValue);

  useEffect(() => {
    latestSeoRef.current = seoValue;
  }, [seoValue]);

  const pageExtraFields = (_locale: 'uk' | 'en', value: LocalizedMeta, onChange: (val: LocalizedMeta) => void) => (
    <SeoCanonicalUrlField
      value={value.canonicalUrl ?? ''}
      onChange={(val) => onChange({ ...value, canonicalUrl: val })}
      onBlur={() => {}}
    />
  );

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

      toast.success('SEO збережено успішно');
    } catch (err) {
      toast.error('Щось пішло не так, спробуйте знову');
      console.error(err);
    }
  };

  return { seoValue, setSeoValue, loading, handleSave, pageExtraFields };
};
