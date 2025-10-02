interface PreviewProps {
  slug: string;
  lang: 'uk' | 'en';
  draftId: string | number;
}

type ConfigResponse = {
  clientAppUrl: string;
};

export const fetchPreview = async ({ slug, lang, draftId }: PreviewProps) => {
  const response = await fetch('/api/config');
  const data: ConfigResponse = await response.json();
  const previewApiUrl = `${data.clientAppUrl}/api/preview?lang=${lang}&slug=${slug}&draftId=${draftId}`;

  try {
    await fetch(previewApiUrl, {
      method: 'GET',
      credentials: 'include'
    });
  } catch {
    //eslint-disable-next-line no-console
    console.warn('Temporary preview fetch failed');
  }

  window.open(previewApiUrl, '_blank');
};
