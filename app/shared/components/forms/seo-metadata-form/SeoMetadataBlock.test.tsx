import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import SeoMetadataBlock from './SeoMetadataBlock';

jest.mock('./SeoMetadataForm', () => ({
  __esModule: true,
  default: ({ locale, onChange, onImageChange, onIndexingChange }: any) => (
    <div>
      <span>{locale}</span>
      <button onClick={() => onChange({ title: 'test', description: '', keywords: '' })}>change-{locale}</button>
      <button onClick={() => onImageChange('file')}>image-{locale}</button>
      <button onClick={() => onIndexingChange(false)}>indexing-{locale}</button>
    </div>
  )
}));

describe('SeoMetadataBlock', () => {
  const locales = ['ua', 'en'];

  const renderBlock = (props = {}) => render(<SeoMetadataBlock {...props} />);

  const clickButton = (text: string) => fireEvent.click(screen.getByText(text));

  it('renders two forms (ua and en)', () => {
    renderBlock();

    locales.forEach((locale) => {
      expect(screen.getByText(locale)).toBeInTheDocument();
    });
  });

  test.each(locales)('updates %s meta state on change', (locale) => {
    renderBlock();

    clickButton(`change-${locale}`);
    expect(screen.getByText(locale)).toBeInTheDocument();
  });

  test.each(locales)('updates %s image state', (locale) => {
    renderBlock();

    clickButton(`image-${locale}`);
    expect(screen.getByText(locale)).toBeInTheDocument();
  });

  test.each(locales)('updates %s indexing state', (locale) => {
    renderBlock();

    clickButton(`indexing-${locale}`);
    expect(screen.getByText(locale)).toBeInTheDocument();
  });

  it('passes props to both forms', () => {
    renderBlock({ showCanonicalUrl: true, showAlternativeText: true });

    locales.forEach((locale) => {
      expect(screen.getByText(locale)).toBeInTheDocument();
    });
  });
});
