import { CardMedia } from '@mui/material';
import { useState } from 'react';

const ImageWithFallback = ({
  src,
  alt,
  fallbackSrc,
  height = '148px'
}: {
  src: string;
  alt: string;
  fallbackSrc: string;
  height?: string;
}) => {
  const [isError, setIsError] = useState(false);

  return (
    <CardMedia
      component="img"
      height={height}
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
