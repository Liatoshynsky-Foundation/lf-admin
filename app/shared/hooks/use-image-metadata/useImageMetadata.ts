import { useEffect, useState } from 'react';

export const useImageMetadata = (imageSrc: string, providedFileName?: string) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [autoFileName, setAutoFileName] = useState<string>('');

  useEffect(() => {
    if (!imageSrc) {
      setDimensions(null);
      setAutoFileName('');
      return;
    }

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
    };

    if (!providedFileName) {
      const name = imageSrc.split('/').pop()?.split('?')[0] || 'unknown';
      setAutoFileName(name);
    }
  }, [imageSrc, providedFileName]);

  return {
    dimensions,
    fileName: providedFileName || autoFileName
  };
};
