interface PreviewProps {
  slug: string;
  lang: 'uk' | 'en';
  draftId: string | number;
}

export const fetchPreview = async ({ slug, lang, draftId }: PreviewProps) => {
  const clientUrl = process.env.NEXT_PUBLIC_CLIENT_BASE_URL;
  if (!clientUrl) {
    throw new Error('Preview configuration error');
  }
  const res = await fetch(`${clientUrl}/api/preview?lang=${lang}&slug=${slug}&draftId=${draftId}`, {
    method: 'GET',
    credentials: 'include'
  });

  const data = await res.json();

  if (res.ok && data.previewUrl) {
    const allowedOrigins = [window.location.origin, new URL(clientUrl).origin];

    const redirectUrl = new URL(data.previewUrl, window.location.origin);

    if (allowedOrigins.includes(redirectUrl.origin)) {
      window.location.href = redirectUrl.href;
    } else {
      throw new Error('Preview failed due to invalid redirect URL');
    }
  } else {
    throw new Error('Failed to start preview');
  }
};
