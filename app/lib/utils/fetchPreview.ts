interface PreviewProps {
  slug: string;
  lang: 'uk' | 'en';
  draftId: string | number;
}

export const fetchPreview = async ({ slug, lang, draftId }: PreviewProps) => {
  const clientUrl = process.env.NEXT_PUBLIC_CLIENT_BASE_URL;
  window.location.href = `${clientUrl}/api/preview?lang=${lang}&slug=${slug}&draftId=${draftId}`;
};
