import createCache from '@emotion/cache';
import { render } from '@testing-library/react';
import { useServerInsertedHTML } from 'next/navigation';

import EmotionProvider from './EmotionProvider';

jest.mock('@emotion/cache', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    key: 'css',
    compat: false,
    inserted: {
      'rule-1': '.test { color: red; }',
      'rule-2': '.box { margin: 10px; }'
    }
  }))
}));

jest.mock('@emotion/react', () => ({
  CacheProvider: ({ children }: { readonly children: React.ReactNode }) => <div>{children}</div>
}));

jest.mock('next/navigation', () => ({
  useServerInsertedHTML: jest.fn((callback: () => React.ReactNode) => callback())
}));

describe('EmotionProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children and set cache options correctly', () => {
    const { container } = render(
      <EmotionProvider>
        <span data-testid="child">Content</span>
      </EmotionProvider>
    );

    expect(container).toHaveTextContent('Content');
    expect(createCache).toHaveBeenCalledWith({ key: 'css', prepend: true });
  });

  it('should execute useServerInsertedHTML and render styles inside server hook', () => {
    render(
      <EmotionProvider>
        <div>Content</div>
      </EmotionProvider>
    );

    expect(useServerInsertedHTML).toHaveBeenCalledTimes(1);

    const renderResult = (useServerInsertedHTML as jest.Mock).mock.results[0].value;
    const { container } = render(renderResult);

    const styleElement = container.querySelector('style');
    expect(styleElement).toBeInTheDocument();
    expect(styleElement).toHaveAttribute('data-emotion', 'css rule-1 rule-2');
    expect(styleElement).toHaveTextContent('.test { color: red; }.box { margin: 10px; }');
  });
});
