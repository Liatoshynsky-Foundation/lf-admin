import { fireEvent, render, screen } from '@testing-library/react';

import SeoMetadataForm, { SeoMetadataFormProps } from './SeoMetadataForm';

jest.mock('~/shared/components/design-system/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({ onChangeImage }: any) => (
    <div data-testid="photo-block" onClick={() => onChangeImage(new File(['img'], 'test.png'))}>
      PhotoBlock
    </div>
  )
}));

const defaultProps: SeoMetadataFormProps = {
  value: {
    title: '',
    description: '',
    keywords: '',
    canonicalUrl: ''
  },
  onChange: jest.fn(),
  locale: 'ua',
  ogImage: null,
  onImageChange: jest.fn(),
  allowIndexing: true,
  onIndexingChange: jest.fn(),
  showCanonicalUrl: true,
  labels: {
    metaTitle: 'Meta title',
    metaDescription: 'Meta description',
    metaKeywords: 'Meta keywords',
    canonicalUrl: 'Canonical URL',
    ogImage: 'OG Image',
    ogImageHint: 'OG Image Hint',
    allowIndexing: 'Allow Indexing',
    sectionTitle: 'Section Title'
  }
};

describe('SeoMetadataForm', () => {
  it('renders all fields and labels', () => {
    render(<SeoMetadataForm {...defaultProps} />);
    expect(screen.getByLabelText(/meta title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/meta description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/meta keywords/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/canonical url/i)).toBeInTheDocument();
    expect(screen.getByText(/section title/i)).toBeInTheDocument();
    expect(screen.getByText(/зображення для соцмереж/i)).toBeInTheDocument();
    expect(screen.getByText(/оптимальний розмір: 1200×630 px\./i)).toBeInTheDocument();
    expect(screen.getByText(/дозволити індексацію сторінки пошуковими системами/i)).toBeInTheDocument();
  });

  it('uses default labels if labels prop is empty', () => {
    const props = { ...defaultProps, labels: {} };
    render(<SeoMetadataForm {...props} />);
    expect(screen.getByLabelText(/meta title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/meta description/i)).toBeInTheDocument();
  });

  it('calls onChange when text fields change', () => {
    render(<SeoMetadataForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/meta title/i), { target: { value: 'New Title' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Title' }));
    fireEvent.change(screen.getByLabelText(/meta description/i), { target: { value: 'New Desc' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(expect.objectContaining({ description: 'New Desc' }));
    fireEvent.change(screen.getByLabelText(/meta keywords/i), { target: { value: 'kw' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(expect.objectContaining({ keywords: 'kw' }));
    fireEvent.change(screen.getByLabelText(/canonical url/i), { target: { value: 'https://test.com' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(expect.objectContaining({ canonicalUrl: 'https://test.com' }));
  });

  it('calls onImageChange when image is selected', () => {
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    render(<SeoMetadataForm {...defaultProps} />);

    fireEvent.click(screen.getByTestId('photo-block'));
    expect(defaultProps.onImageChange).toHaveBeenCalled();
  });

  it('renders fileName correctly when ogImage is string', () => {
    const props = { ...defaultProps, ogImage: 'https://example.com/image.png' };
    render(<SeoMetadataForm {...props} />);
    const photoBlock = screen.getByTestId('photo-block');
    expect(photoBlock).toBeInTheDocument();
  });

  it('handles ogImage as string and sets fileName correctly', () => {
    const props = { ...defaultProps, ogImage: 'https://example.com/image.png' };
    render(<SeoMetadataForm {...props} />);

    const photoBlock = screen.getByTestId('photo-block');
    expect(photoBlock).toBeInTheDocument();

    fireEvent.click(photoBlock);
    expect(defaultProps.onImageChange).toHaveBeenCalled();
  });

  it('uses ogImagePreview when ogImage is string (covers ogImagePreview || "")', () => {
    const props = {
      ...defaultProps,
      ogImage: 'https://example.com/image.png'
    };

    render(<SeoMetadataForm {...props} />);

    const photoBlock = screen.getByTestId('photo-block');
    expect(photoBlock).toBeInTheDocument();
  });

  it('updates ogImagePreview after image change (covers ogImagePreview || "")', () => {
    global.URL.createObjectURL = jest.fn(() => 'mock-url');

    render(<SeoMetadataForm {...defaultProps} />);

    const photoBlock = screen.getByTestId('photo-block');

    fireEvent.click(photoBlock);

    expect(defaultProps.onImageChange).toHaveBeenCalled();
  });

  it('handles ogImage as File (covers fileName branch)', () => {
    const file = new File(['img'], 'test.png', { type: 'image/png' });

    render(<SeoMetadataForm {...defaultProps} ogImage={file} />);

    expect(screen.getByTestId('photo-block')).toBeInTheDocument();
  });

  it('calls onIndexingChange when checkbox is toggled', () => {
    render(<SeoMetadataForm {...defaultProps} allowIndexing={false} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(defaultProps.onIndexingChange).toHaveBeenCalledWith(true);
  });

  it('does not call onIndexingChange when checkbox is not toggled', () => {
    render(<SeoMetadataForm {...defaultProps} allowIndexing={true} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(defaultProps.onIndexingChange).toHaveBeenCalledWith(false);
  });

  it('does not render Canonical URL if showCanonicalUrl is false', () => {
    render(<SeoMetadataForm {...defaultProps} showCanonicalUrl={false} />);
    expect(screen.queryByLabelText(/canonical url/i)).not.toBeInTheDocument();
  });

  it('renders Canonical URL if showCanonicalUrl is true', () => {
    render(<SeoMetadataForm {...defaultProps} showCanonicalUrl={true} />);
    expect(screen.getByLabelText(/canonical url/i)).toBeInTheDocument();
  });

  it('handles empty canonicalUrl (fallback to empty string)', () => {
    const props = {
      ...defaultProps,
      value: {
        title: '',
        description: '',
        keywords: ''
      }
    };

    render(<SeoMetadataForm {...props} />);
    expect(screen.getByLabelText(/canonical url/i)).toBeInTheDocument();
  });

  it('renders with custom labels', () => {
    const labels = {
      metaTitle: 'Заголовок',
      metaDescription: 'Опис',
      metaKeywords: 'Ключові слова',
      canonicalUrl: 'Канонічна URL',
      ogImage: 'OG Зображення',
      ogImageHint: 'Підказка',
      allowIndexing: 'Індексація',
      sectionTitle: 'Секція'
    };
    render(<SeoMetadataForm {...defaultProps} labels={labels} />);
    expect(screen.getByLabelText(/заголовок/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/опис/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ключові слова/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/канонічна url/i)).toBeInTheDocument();
    expect(screen.getByText(/секція/i)).toBeInTheDocument();
  });
});
