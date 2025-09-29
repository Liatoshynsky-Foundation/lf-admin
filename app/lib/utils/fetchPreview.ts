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
  window.open(`${data.clientAppUrl}/api/preview?lang=${lang}&slug=${slug}&draftId=${draftId}`, '_blank');
};
