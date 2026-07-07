interface PreviewProps {
  slug: string;
  lang: 'uk' | 'en';
  draftId: string | number;
}

type ConfigResponse = {
  clientAppUrl: string;
};

type PreviewProxyResponse = {
  previewSecret: string;
};

export const fetchPreview = async ({ slug, lang, draftId }: PreviewProps) => {
  const response = await fetch('/api/config');
  const data: ConfigResponse = await response.json();

  const proxyResponse = await fetch('/api/preview-proxy', {
    method: 'GET',
    credentials: 'include'
  });

  if (!proxyResponse.ok) {
    throw new Error('Failed to obtain preview credentials');
  }

  const { previewSecret } = (await proxyResponse.json()) as PreviewProxyResponse;

  const params = new URLSearchParams({
    lang,
    slug,
    draftId: String(draftId),
    previewSecret
  });

  const previewApiUrl = `${data.clientAppUrl}/api/preview?${params}`;

  window.open(previewApiUrl, '_blank');
};
