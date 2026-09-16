import toast from 'react-hot-toast';

import { fetchPreview } from '~/lib/utils/fetchPreview';

export const usePreviewHandler = () => {
  const handlePreview = async (
    savePromise: Promise<{ id: string; slug: string } | null> | undefined,
    baseRoute: string
  ) => {
    if (!savePromise) return;

    try {
      const result = await savePromise;
      
      if (!result?.id || !result?.slug) {
        return;
      }

      const previewSlug = `${baseRoute}/${result.slug}`;

      await fetchPreview({ slug: previewSlug, lang: 'uk', draftId: result.id });
    } catch {
      toast.error('Не вдалося відкрити попередній перегляд.');
    }
  };

  return { handlePreview };
};
