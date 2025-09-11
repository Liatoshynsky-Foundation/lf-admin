interface PreviewProps {
  slug: string;
  lang: 'uk' | 'en';
  draftId: string | number;
}

export const fetchPreview = async ({ slug, lang, draftId }: PreviewProps) => {
  const clientUrl = process.env.NEXT_PUBLIC_CLIENT_BASE_URL;
  const res = await fetch(`${clientUrl}/api/preview?lang=${lang}&slug=${slug}&draftId=${draftId}`, {
    method: 'GET',
    credentials: 'include'
  });

  const data = await res.json();

  if (res.ok && data.previewUrl) {
    window.open(data.previewUrl, '_blank');
    throw new Error('Failed to start preview');
  }
};
