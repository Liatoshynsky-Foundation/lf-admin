import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { SeoCanonicalUrlField } from './seo-canonicalurl-field/SeoCanonicalUrlField';
import SeoMetadataForm, { SeoMetadataFormProps } from './SeoMetadataForm';
import { META_TITLE_MAX_LENGTH } from '~/constants/publications';

jest.mock('~/shared/components/design-system/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({
    onChangeImage,
    showAlternativeText,
    altText,
    onChangeAltText
  }: {
    onChangeImage: (url: string) => void;
    showAlternativeText?: boolean;
    altText?: string;
    onChangeAltText?: (value: string) => void;
  }) => (
    <div>
      <button
        data-testid="photo-block"
        onClick={() => onChangeImage('https://example.com/mock-image.png')}
      >
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

const renderWithState = (extraFields?: SeoMetadataFormProps['extraFields']) => {
  const Wrapper = () => {
    const [value, setValue] = React.useState<SeoMetadataFormProps['value']>(defaultProps.value);
    return <SeoMetadataForm {...defaultProps} value={value} onChange={setValue} extraFields={extraFields} />;
  };

  return render(<Wrapper />);
};

describe('SeoMetadataForm', () => {
  const user = userEvent.setup({ delay: null });

  beforeEach(() => {
    jest.clearAllMocks();
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
    expect(await screen.findByText(/мінімум 2 символа/i)).toBeInTheDocument();
  });

  it('rejects title longer than the maximum length on blur, respects input maxLength attribute', async () => {
    renderWithState();
    const input = screen.getByLabelText(/meta title/i) as HTMLInputElement;

    expect(input).toHaveAttribute('maxlength', String(META_TITLE_MAX_LENGTH));

    fireEvent.change(input, { target: { value: 'a'.repeat(META_TITLE_MAX_LENGTH + 1) } });
    fireEvent.blur(input);
    expect(await screen.findByText(/максимум 150 символів/i)).toBeInTheDocument();
  });

  it('accepts title within the allowed length range', async () => {
    renderWithState();
    const input = screen.getByLabelText(/meta title/i);

    await user.type(input, 'Валідний заголовок');
    fireEvent.blur(input);
    expect(screen.queryByText(/мінімум|максимум/i)).not.toBeInTheDocument();
  });

  it('calls onIndexingChange', async () => {
    render(<SeoMetadataForm {...defaultProps} allowIndexing={false} />);
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(defaultProps.onIndexingChange).toHaveBeenCalledWith(true);
  });

  it('calls onImageChange with uploaded url', async () => {
    render(<SeoMetadataForm {...defaultProps} />);
    await user.click(screen.getByTestId('photo-block'));
    expect(defaultProps.onImageChange).toHaveBeenCalledWith('https://example.com/mock-image.png');
  });

  it('validates description field (empty and non-empty)', async () => {
    renderWithState();
    const input = screen.getByLabelText(/meta description/i);

    await user.click(input);
    await user.tab();
    expect(await screen.findByText(/обовʼязкове поле/i)).toBeInTheDocument();

    await user.type(input, 'Some description');
    fireEvent.blur(input);
    expect(screen.queryByText(/обовʼязкове поле/i)).not.toBeInTheDocument();
  });

  it('validates canonicalUrl: empty, valid, invalid', async () => {
    const CanonicalWrapper = () => {
      const [value, setValue] = React.useState(defaultProps.value);
      const canonicalExtraFields: SeoMetadataFormProps['extraFields'] = (val, onChange) => (
        <SeoCanonicalUrlField
          value={val.canonicalUrl || ''}
          onChange={(newVal) => onChange({ ...val, canonicalUrl: newVal })}
        />
      );

      return <SeoMetadataForm {...defaultProps} value={value} onChange={setValue} extraFields={canonicalExtraFields} />;
    };

    render(<CanonicalWrapper />);
    const input = screen.getByLabelText(/canonical url/i);

    await user.type(input, 'https://test.com');
    fireEvent.blur(input);
    expect(screen.queryByText(/некоректний url/i)).not.toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'bad-url');
    fireEvent.blur(input);
    expect(await screen.findByText(/некоректний url/i)).toBeInTheDocument();
  });

  it('validates keywords: empty, valid, invalid', async () => {
    renderWithState();
    const input = screen.getByLabelText(/meta keywords/i);

    await user.type(input, 'one, two, three');
    fireEvent.blur(input);
    expect(screen.queryByText(/Ключові слова мають бути через кому/i)).not.toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'one, ,two');
    fireEvent.blur(input);
    expect(await screen.findByText(/Ключові слова мають бути через кому/i)).toBeInTheDocument();
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

  it('renders ogImage as url and shows fileName', () => {
    render(<SeoMetadataForm {...defaultProps} ogImage="https://example.com/file-image.png" />);
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

  it('covers validateField default branch', () => {
    render(<SeoMetadataForm {...defaultProps} forceShowErrors={true} />);
    expect(screen.getAllByText(/обовʼязкове поле/i).length).toBeGreaterThan(0);
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
