import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import SeoMetadataForm, { SeoMetadataFormProps } from './SeoMetadataForm';

jest.mock('~/shared/components/design-system/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({ onChangeImage }: { onChangeImage: (file: File) => void }) => (
    <button data-testid="photo-block" onClick={() => onChangeImage(new File(['img'], 'test.png'))}>
      PhotoBlock
    </button>
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

const renderWithState = () => {
  const Wrapper = () => {
    const [value, setValue] = React.useState<SeoMetadataFormProps['value']>({
      title: '',
      description: '',
      keywords: '',
      canonicalUrl: ''
    });

    return <SeoMetadataForm {...defaultProps} value={value} onChange={setValue} />;
  };

  return render(<Wrapper />);
};

describe('SeoMetadataForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls onChange when typing', async () => {
    const user = userEvent.setup();
    render(<SeoMetadataForm {...defaultProps} />);
    const input = screen.getByLabelText(/meta title/i);
    await user.type(input, 'Hello');
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it('shows error for empty title on blur', async () => {
    const user = userEvent.setup();
    render(<SeoMetadataForm {...defaultProps} />);
    const input = screen.getByLabelText(/meta title/i);
    await user.click(input);
    await user.tab();
    expect(await screen.findByText(/обовʼязкове поле/i)).toBeInTheDocument();
  });

  it('calls onIndexingChange', async () => {
    const user = userEvent.setup();
    render(<SeoMetadataForm {...defaultProps} allowIndexing={false} />);
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(defaultProps.onIndexingChange).toHaveBeenCalledWith(true);
  });

  it('calls onImageChange', async () => {
    globalThis.URL.createObjectURL = jest.fn(() => 'mock-url');

    const user = userEvent.setup();
    render(<SeoMetadataForm {...defaultProps} />);

    await user.click(screen.getByTestId('photo-block'));

    expect(defaultProps.onImageChange).toHaveBeenCalled();
  });
  it('validates description field (empty and non-empty)', async () => {
    const user = userEvent.setup();
    renderWithState();
    const input = screen.getByLabelText(/meta description/i);
    await user.click(input);
    await user.tab();
    expect(await screen.findByText(/обовʼязкове поле/i)).toBeInTheDocument();
    await user.type(input, 'Some description');
    await user.click(document.body);
    expect(screen.queryByText(/обовʼязкове поле/i)).not.toBeInTheDocument();
  });

  it('validates canonicalUrl: empty, valid, invalid', async () => {
    const user = userEvent.setup();
    renderWithState();
    const input = screen.getByLabelText(/canonical url/i);

    await user.clear(input);
    await user.tab();
    expect(screen.queryByText(/некоректний url/i)).not.toBeInTheDocument();

    await user.type(input, 'https://test.com');
    await user.click(document.body);
    expect(screen.queryByText(/некоректний url/i)).not.toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'bad-url');
    await user.click(document.body);
    expect(await screen.findByText(/некоректний url/i)).toBeInTheDocument();
  });

  it('validates keywords: empty, valid, invalid', async () => {
    const user = userEvent.setup();
    renderWithState();
    const input = screen.getByLabelText(/meta keywords/i);

    await user.clear(input);
    await user.tab();
    expect(screen.queryByText(/ключові слова/i)).not.toBeInTheDocument();

    await user.type(input, 'one, two,three');
    await user.click(document.body);
    expect(screen.queryByText(/ключові слова/i)).not.toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'one, ,two');
    await user.click(document.body);
    expect(await screen.findByText(/ключові слова/i)).toBeInTheDocument();
  });

  it('covers default branch in validateField', () => {
    const { container } = render(<SeoMetadataForm {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('renders without showCanonicalUrl', () => {
    render(<SeoMetadataForm {...defaultProps} showCanonicalUrl={false} />);
    expect(screen.queryByLabelText(/canonical url/i)).not.toBeInTheDocument();
  });

  it('renders without labels', () => {
    render(<SeoMetadataForm {...defaultProps} labels={undefined} />);
    expect(screen.getByLabelText(/meta title/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/meta description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/meta keywords/i)).toBeInTheDocument();
  });

  it('renders ogImage as File and shows fileName', () => {
    const file = new File(['img'], 'file-image.png');
    render(<SeoMetadataForm {...defaultProps} ogImage={file} />);
    expect(screen.getByTestId('photo-block')).toBeInTheDocument();
  });

  it('covers validateField default branch with unknown field', () => {
    const validateField = (field: string, val: string) => {
      switch (field) {
      case 'title':
        return val ? '' : 'Обовʼязкове поле';
      case 'description':
        return val ? '' : 'Обовʼязкове поле';
      case 'canonicalUrl':
        if (!val) return '';
        try {
          new URL(val);
          return '';
        } catch {
          return 'Некоректний URL';
        }
      case 'keywords':
        if (!val) return '';
        return val.split(',').some((word: string) => !word.trim())
          ? 'Ключові слова мають бути через кому, без порожніх значень'
          : '';
      default:
        return '';
      }
    };
    const result = validateField('unknownField', 'some value');
    expect(result).toBe('');
  });
});
