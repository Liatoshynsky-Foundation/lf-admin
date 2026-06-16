export default ImageWithFallback;
import { fireEvent, render, screen } from '@testing-library/react';

import ImageWithFallback from './ImageWithFallback';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

describe('ImageWithFallback', () => {
  const defaultProps = {
    src: 'test-src',
    alt: 'test-alt',
    fallbackSrc: 'test-fallback-src'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display the correct image source', () => {
    render(<ImageWithFallback {...defaultProps} />);

    expect(screen.getByRole('img')).toHaveAttribute('src', defaultProps.src);
  });

  it('should display fallback image on error', () => {
    render(<ImageWithFallback {...defaultProps} />);

    const image = screen.getByRole('img');
    fireEvent.error(image);

    expect(image).toHaveAttribute('src', defaultProps.fallbackSrc);
  });
});
