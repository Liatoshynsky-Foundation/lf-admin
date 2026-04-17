/**
 * Mock for next/image in Storybook.
 * Since we use @storybook/react-vite (not nextjs), we need to mock Next.js components.
 */
import React from 'react';

const Image = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    sizes?: string;
    priority?: boolean;
    quality?: number;
  }
>(({ fill, sizes: _sizes, priority: _priority, quality: _quality, alt, style: imageStyle, ...props }, ref) => {
  const style: React.CSSProperties = fill
    ? { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', ...imageStyle }
    : imageStyle || {};

  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} alt={alt ?? ''} {...props} style={style} />;
});

Image.displayName = 'MockNextImage';
export default Image;
