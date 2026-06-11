import { CardMedia } from '@mui/material';
import { useState } from 'react';

const ImageWithFallback = ({ src, alt, fallbackSrc }: { src: string; alt: string; fallbackSrc: string }) => {
  const [isError, setIsError] = useState(false);

  return <CardMedia component="img" image={isError ? fallbackSrc : src} alt={alt} onError={() => setIsError(true)} />;
};

export default ImageWithFallback;
