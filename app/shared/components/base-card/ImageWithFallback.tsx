import { CardMedia } from '@mui/material';
import { useState } from 'react';

const ImageWithFallback = ({ src, alt, fallbackSrc }: { src: string; alt: string; fallbackSrc: string }) => {
  const [isError, setIsError] = useState(false);

  return (
    <CardMedia
      component="img"
      height="148px"
      image={isError ? fallbackSrc : src}
      alt={alt}
      onError={() => setIsError(true)}
      sx={{
        objectPosition: 'top'
      }}
    />
  );
};

export default ImageWithFallback;
