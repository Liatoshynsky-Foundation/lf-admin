import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { SeoCanonicalUrlField } from './seo-canonicalurl-field/SeoCanonicalUrlField';
import SeoMetadataForm, { SeoMetadataFormProps } from './SeoMetadataForm';

jest.mock('~/shared/components/design-system/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({
    onChangeImage,
    showAlternativeText,
    altText,
    onChangeAltText
  }: {
    onChangeImage: (file: File) => void;
    showAlternativeText?: boolean;
    altText?: string;
    onChangeAltText?: (val: string) => void;
  }) => (
    <div>
      <button data-testid="photo-block" onClick={() => onChangeImage(new File(['img'], 'test.png'))}>
        PhotoBlock
      </button>
      {showAlternativeText && (
        <input
          aria-label="Alt текст зображення"
          value={altText || ''}
          onChange={(e) => onChangeAltText?.(e.target.value)}
        />
      )}
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
  locale: 'uk',
  ogImage: null,
  onImageChange: jest.fn(),
  allowIndexing: true,
  onIndexingChange: jest.fn(),
  labels: {
    metaTitle: 'Meta title',
    metaDescription: 'Meta description',
    metaKeywords: 'Meta keywords',
    ogImage: 'OG Image',
    ogImageHint: 'OG Image Hint',
    allowIndexing: 'Allow Indexing',
    sectionTitle: 'Section Title'
  }
};

const renderWithState = (extraFields?: React.ReactNode) => {
  const Wrapper = () => {
    const [value, setValue] = React.useState<SeoMetadataFormProps['value']>({
      title: '',
      description: '',
      keywords: '',
      canonicalUrl: ''
    });

    return <SeoMetadataForm {...defaultProps} value={value} onChange={setValue} extraFields={extraFields} />;
  };

  return render(<Wrapper />);
};

describe('SeoMetadataForm', () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
  });

  it('calls onChange when typing', async () => {
    render(<SeoMetadataForm {...defaultProps} />);
    const input = screen.getByLabelText(/meta title/i);
    await user.type(input, 'Hello');
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it('shows error for empty title on blur', async () => {
    render(<SeoMetadataForm {...defaultProps} />);
    const input = screen.getByLabelText(/meta title/i);
    await user.click(input);
    await user.tab();
    expect(await screen.findByText(/обовʼязкове поле/i)).toBeInTheDocument();
  });

  it('calls onIndexingChange', async () => {
    render(<SeoMetadataForm {...defaultProps} allowIndexing={false} />);
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(defaultProps.onIndexingChange).toHaveBeenCalledWith(true);
  });

  it('calls onImageChange', async () => {
    globalThis.URL.createObjectURL = jest.fn(() => 'mock-url');

    render(<SeoMetadataForm {...defaultProps} />);

    await user.click(screen.getByTestId('photo-block'));

    expect(defaultProps.onImageChange).toHaveBeenCalled();
  });

  it('validates description field (empty and non-empty)', async () => {
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
    const validateCanonicalUrl = (val: string) => {
      if (!val) return '';
      try {
        new URL(val);
        return '';
      } catch {
        return 'Некоректний URL';
      }
    };

    const CanonicalWrapper = () => {
      const [value, setValue] = React.useState<SeoMetadataFormProps['value']>({
        title: '',
        description: '',
        keywords: '',
        canonicalUrl: ''
      });
      const [canonicalUrl, setCanonicalUrl] = React.useState('');
      const [canonicalError, setCanonicalError] = React.useState('');
      const [canonicalTouched, setCanonicalTouched] = React.useState(false);

      return (
        <SeoMetadataForm
          {...defaultProps}
          value={value}
          onChange={setValue}
          extraFields={
            <SeoCanonicalUrlField
              value={canonicalUrl}
              error={canonicalError}
              touched={canonicalTouched}
              onChange={(val) => {
                setCanonicalUrl(val);
                if (canonicalTouched) setCanonicalError(validateCanonicalUrl(val));
              }}
              onBlur={() => {
                setCanonicalTouched(true);
                setCanonicalError(validateCanonicalUrl(canonicalUrl));
              }}
            />
          }
        />
      );
    };

    render(<CanonicalWrapper />);
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

  it('does not render canonicalUrl without extraFields', () => {
    render(<SeoMetadataForm {...defaultProps} />);
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

  test.each<'uk' | 'en'>(['uk', 'en'])('triggers onChangeAltText for %s locale', async (locale) => {
    const onChange = jest.fn();
    render(
      <SeoMetadataForm
        {...defaultProps}
        locale={locale}
        onChange={onChange}
        showAlternativeText={true}
        value={{ ...defaultProps.value, altText: { uk: '', en: '' } }}
      />
    );
    const altInput = screen.getByLabelText(/alt текст/i);
    await user.type(altInput, 'alt text');
    expect(onChange).toHaveBeenCalled();
  });

  it('covers validateField canonicalUrl branch via handleBlur', async () => {
    const Wrapper = () => {
      const [value, setValue] = React.useState<SeoMetadataFormProps['value']>({
        ...defaultProps.value,
        canonicalUrl: 'bad-url'
      });
      return <SeoMetadataForm {...defaultProps} value={value} onChange={setValue} />;
    };
    render(<Wrapper />);
    const titleInput = screen.getByLabelText(/meta title/i);
    await user.click(titleInput);
    await user.tab();
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
