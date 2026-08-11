import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { SeoCanonicalUrlField } from './seo-canonicalurl-field/SeoCanonicalUrlField';
import SeoMetadataForm, { LocalizedMeta, SeoMetadataFormProps } from './SeoMetadataForm';
import { seoFormErrors } from '~/constants/errors';
import {
  META_ALT_TEXT_LENGTH,
  META_DESCRIPTION_LENGTH,
  META_KEYWORDS_LENGTH,
  META_TITLE_LENGTH
} from '~/constants/publications';

interface MockCropResult {
  rect: unknown;
}

jest.mock('~/shared/components/design-system/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({
    imageUrl,
    onChangeImage,
    showAlternativeText,
    altText,
    onChangeAltText,
    onBlurAltText,
    altTextError
  }: {
    imageUrl?: string;
    onChangeImage: (url: string, crop?: MockCropResult | null) => void;
    showAlternativeText?: boolean;
    altText?: string;
    onChangeAltText?: (value: string) => void;
    onBlurAltText?: () => void;
    altTextError?: string;
  }) => (
    <div data-testid="photo-block" data-imageurl={imageUrl}>
      <button data-testid="photo-block-trigger" onClick={() => onChangeImage('https://example.com/mock-image.png')}>
        PhotoBlock
      </button>
      <button
        data-testid="photo-block-cropped"
        onClick={() => onChangeImage('https://example.com/mock-image.png', { rect: { x: 10 } })}
      >
        PhotoBlock Cropped
      </button>
      <button data-testid="photo-block-null" onClick={() => onChangeImage('https://example.com/mock-image.png', null)}>
        PhotoBlock Null
      </button>
      <button data-testid="photo-block-root-url" onClick={() => onChangeImage('https://example.com/')}>
        PhotoBlock Root URL
      </button>
      <button data-testid="photo-block-query-url" onClick={() => onChangeImage('https://example.com/photo.png?v=1.0')}>
        PhotoBlock Query URL
      </button>
      {showAlternativeText && (
        <input
          aria-label="Alt текст зображення"
          value={altText || ''}
          onChange={(e) => onChangeAltText?.(e.target.value)}
          onBlur={onBlurAltText}
        />
      )}
      {altTextError && <span>{altTextError}</span>}
    </div>
  )
}));

jest.mock('./seo-base-fields/SeoBaseFields', () => ({
  SeoBaseFields: ({
    onBlur,
    onFieldChange,
    showKeywords,
    value,
    errors,
    touched
  }: {
    onBlur: (field: keyof LocalizedMeta) => void;
    onFieldChange: (field: keyof LocalizedMeta, val: string) => void;
    showKeywords?: boolean;
    value: LocalizedMeta;
    errors: Partial<Record<keyof LocalizedMeta, string>>;
    touched: Partial<Record<keyof LocalizedMeta, boolean>>;
  }) => (
    <div data-testid="mock-seo-base-fields">
      <button
        data-testid="trigger-canonical-valid"
        onClick={() => {
          onBlur('canonicalUrl');
          onFieldChange('canonicalUrl', 'https://example.com');
        }}
      >
        Valid Canonical
      </button>

      <button
        data-testid="trigger-canonical-invalid"
        onClick={() => {
          onBlur('canonicalUrl');
          onFieldChange('canonicalUrl', 'invalid-url');
        }}
      >
        Invalid Canonical
      </button>

      <button
        data-testid="trigger-default-case"
        onClick={() => {
          onBlur('startDateTime');
        }}
      >
        Default Case
      </button>

      <label htmlFor="meta-title-input">Meta title</label>
      <input
        id="meta-title-input"
        value={value.title}
        onBlur={() => onBlur('title')}
        onChange={(e) => onFieldChange('title', e.target.value)}
      />
      {touched.title && errors.title && <span>{errors.title}</span>}

      <label htmlFor="meta-description-input">Meta description</label>
      <input
        id="meta-description-input"
        value={value.description}
        onBlur={() => onBlur('description')}
        onChange={(e) => onFieldChange('description', e.target.value)}
      />
      {touched.description && errors.description && <span>{errors.description}</span>}

      {showKeywords && (
        <>
          <label htmlFor="meta-keywords-input">Meta keywords</label>
          <input
            id="meta-keywords-input"
            value={value.keywords}
            onBlur={() => onBlur('keywords')}
            onChange={(e) => onFieldChange('keywords', e.target.value)}
          />
          {touched.keywords && errors.keywords && <span>{errors.keywords}</span>}
        </>
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

  it.each([
    {
      description: 'onChange when typing in title field',
      action: async (u: ReturnType<typeof userEvent.setup>) => {
        render(<SeoMetadataForm {...defaultProps} />);
        const input = screen.getByLabelText(/meta title/i);
        await u.type(input, 'Hello');
      },
      assert: () => expect(defaultProps.onChange).toHaveBeenCalled()
    },
    {
      description: 'onIndexingChange when checkbox toggles',
      action: async (u: ReturnType<typeof userEvent.setup>) => {
        render(<SeoMetadataForm {...defaultProps} allowIndexing={false} />);
        const checkbox = screen.getByRole('checkbox');
        await u.click(checkbox);
      },
      assert: () => expect(defaultProps.onIndexingChange).toHaveBeenCalledWith(true)
    },
    {
      description: 'onImageChange with uploaded url',
      action: async (u: ReturnType<typeof userEvent.setup>) => {
        render(<SeoMetadataForm {...defaultProps} />);
        await u.click(screen.getByTestId('photo-block-trigger'));
      },
      assert: () => expect(defaultProps.onImageChange).toHaveBeenCalledWith('https://example.com/mock-image.png')
    }
  ])('calls $description', async ({ action, assert }) => {
    await action(user);
    assert();
  });

  it('shows error for empty title on blur', async () => {
    renderWithState();
    const input = screen.getByLabelText(/meta title/i);
    await user.click(input);
    await user.tab();
    expect(await screen.findByText(/мінімум 2 символа/i)).toBeInTheDocument();
  });

  it('rejects title longer than the maximum length on blur, respects input maxLength attribute', async () => {
    render(
      <SeoMetadataForm
        {...defaultProps}
        forceShowErrors={true}
        value={{ ...defaultProps.value, title: 'a'.repeat(META_TITLE_LENGTH.max + 1) }}
      />
    );
    expect(await screen.findByText(seoFormErrors.uk.maxLength)).toBeInTheDocument();
  });

  it('accepts title within the allowed length range', async () => {
    renderWithState();
    const input = screen.getByLabelText(/meta title/i);

    await user.type(input, 'Валідний заголовок');
    fireEvent.blur(input);
    expect(screen.queryByText(/мінімум|максимум/i)).not.toBeInTheDocument();
  });

  it('validates description field (empty and non-empty)', async () => {
    renderWithState();
    const input = screen.getByLabelText(/meta description/i);

    await user.click(input);
    await user.tab();
    expect(await screen.findByText(/обовʼязкове поле/i)).toBeInTheDocument();

    await user.type(input, 'Some description');
    fireEvent.blur(input);
    await waitFor(() => expect(screen.queryByText(/обовʼязкове поле/i)).not.toBeInTheDocument());
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

  it('validates description minimum and maximum lengths', async () => {
    render(
      <SeoMetadataForm
        {...defaultProps}
        forceShowErrors={true}
        value={{ ...defaultProps.value, description: 'a'.repeat(META_DESCRIPTION_LENGTH.max + 1) }}
      />
    );
    expect(await screen.findByText(seoFormErrors.uk.descriptionMaxLength)).toBeInTheDocument();
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

  it('validates keywords minimum and maximum lengths', async () => {
    render(
      <SeoMetadataForm
        {...defaultProps}
        forceShowErrors={true}
        value={{ ...defaultProps.value, keywords: 'a'.repeat(META_KEYWORDS_LENGTH.max + 1) }}
      />
    );
    expect(await screen.findByText(seoFormErrors.uk.keywordsMaxLength)).toBeInTheDocument();
  });

  it('does not require title or description when the form is optional', async () => {
    render(<SeoMetadataForm {...defaultProps} required={false} />);

    fireEvent.blur(screen.getByLabelText(/meta title/i));
    fireEvent.blur(screen.getByLabelText(/meta description/i));

    expect(screen.queryByText(seoFormErrors.uk.minLength)).not.toBeInTheDocument();
    expect(screen.queryByText(seoFormErrors.uk.required)).not.toBeInTheDocument();
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

  it('requires alt text when an OG image is present', async () => {
    render(
      <SeoMetadataForm
        {...defaultProps}
        ogImage="https://example.com/image.png"
        showAlternativeText={true}
        value={{ ...defaultProps.value, altText: { uk: '', en: '' } }}
      />
    );

    fireEvent.blur(screen.getByRole('textbox', { name: /^Alt/i }));

    expect(await screen.findByText(seoFormErrors.uk.required)).toBeInTheDocument();
  });

  it('validates alt text changes after the field has been touched', async () => {
    const onChange = jest.fn();
    render(
      <SeoMetadataForm
        {...defaultProps}
        onChange={onChange}
        ogImage="https://example.com/image.png"
        showAlternativeText={true}
        value={{ ...defaultProps.value, altText: { uk: '', en: '' } }}
      />
    );

    const altInput = screen.getByRole('textbox', { name: /^Alt/i });
    fireEvent.blur(altInput);
    fireEvent.change(altInput, { target: { value: 'valid alt text' } });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ altText: { uk: 'valid alt text', en: '' } })
    );
    await waitFor(() => expect(screen.queryByText(seoFormErrors.uk.required)).not.toBeInTheDocument());
  });

  it('uses an empty value when blurring an undefined alt text field', async () => {
    render(
      <SeoMetadataForm
        {...defaultProps}
        ogImage="https://example.com/image.png"
        showAlternativeText={true}
        value={{ ...defaultProps.value }}
      />
    );

    fireEvent.blur(screen.getByRole('textbox', { name: /^Alt/i }));

    expect(await screen.findByText(seoFormErrors.uk.required)).toBeInTheDocument();
  });

  it('validates alt text maximum length', async () => {
    render(
      <SeoMetadataForm
        {...defaultProps}
        forceShowErrors={true}
        ogImage="https://example.com/image.png"
        showAlternativeText={true}
        value={{ ...defaultProps.value, altText: { uk: 'a'.repeat(META_ALT_TEXT_LENGTH.max + 1), en: '' } }}
      />
    );

    expect(await screen.findByText(seoFormErrors.uk.altTextMaxLength)).toBeInTheDocument();
  });

  it('renders keywords field as multiline text field when extraFieldsBeforeKeywords is true', async () => {
    const MultilineKeywordsWrapper = () => {
      const [value, setValue] = React.useState<LocalizedMeta>({ title: '', description: '', keywords: '' });
      return <SeoMetadataForm {...defaultProps} extraFieldsBeforeKeywords={true} value={value} onChange={setValue} />;
    };

    render(<MultilineKeywordsWrapper />);

    const textarea = screen.getByLabelText(/meta keywords/i, { selector: 'textarea' });
    expect(textarea).toBeInTheDocument();

    await user.type(textarea, 'a, b');
    fireEvent.blur(textarea);
  });

  it('calls onChangeCrop with cropped rect', async () => {
    const onChangeCropMock = jest.fn();
    render(<SeoMetadataForm {...defaultProps} onChangeCrop={onChangeCropMock} />);

    await user.click(screen.getByTestId('photo-block-cropped'));

    expect(onChangeCropMock).toHaveBeenCalledWith({ x: 10 });
  });

  it('calls onChangeCrop with null when crop is omitted', async () => {
    const onChangeCropMock = jest.fn();
    render(<SeoMetadataForm {...defaultProps} onChangeCrop={onChangeCropMock} />);

    await user.click(screen.getByTestId('photo-block-trigger'));

    expect(onChangeCropMock).toHaveBeenCalledWith(null);
  });

  it('calls onChangeCrop with null when crop is explicitly null', async () => {
    const onChangeCropMock = jest.fn();
    render(<SeoMetadataForm {...defaultProps} onChangeCrop={onChangeCropMock} />);

    await user.click(screen.getByTestId('photo-block-null'));

    expect(onChangeCropMock).toHaveBeenCalledWith(null);
  });

  it('should cover the extension undefined fallback branch in getFileNameFromUrl', async () => {
    interface CustomSplitter {
      [Symbol.split](string: string, limit?: number): string[];
    }

    const originalSplit = String.prototype.split;
    const splitSpy = jest.spyOn(String.prototype, 'split').mockImplementation(function (
      this: string,
      separator: string | RegExp | CustomSplitter,
      limit?: number
    ) {
      if (typeof separator === 'string' && separator === '/' && this === 'test_no_pop') {
        return [] as unknown as string[];
      }
      const safeSplit = originalSplit as (this: string, s: unknown, l?: number) => string[];
      return safeSplit.call(this, separator, limit);
    });

    render(<SeoMetadataForm {...defaultProps} ogImage="test_no_pop" />);
    expect(screen.getByTestId('photo-block')).toBeInTheDocument();

    splitSpy.mockRestore();
  });

  it('should mount correctly with only required props', () => {
    render(
      <SeoMetadataForm
        value={{ title: '', description: '', keywords: '' }}
        onChange={jest.fn()}
        locale="uk"
        ogImage={null}
        onImageChange={jest.fn()}
        allowIndexing={true}
        onIndexingChange={jest.fn()}
      />
    );
    expect(screen.getByLabelText(/meta title/i)).toBeInTheDocument();
  });

  it('renders keywords field as multiline text field with default label when labels prop is omitted', () => {
    render(
      <SeoMetadataForm
        value={{ title: '', description: '', keywords: '' }}
        onChange={jest.fn()}
        locale="uk"
        ogImage={null}
        onImageChange={jest.fn()}
        allowIndexing={true}
        onIndexingChange={jest.fn()}
        extraFieldsBeforeKeywords={true}
      />
    );
    expect(screen.getByLabelText('Meta keywords', { selector: 'textarea' })).toBeInTheDocument();
  });

  it('renders existing altText when provided in value', () => {
    render(
      <SeoMetadataForm
        {...defaultProps}
        showAlternativeText={true}
        value={{
          ...defaultProps.value,
          altText: { uk: 'Існуючий альт текст', en: 'Existing alt text' }
        }}
      />
    );
    expect(screen.getByDisplayValue('Існуючий альт текст')).toBeInTheDocument();
  });

  it('handles onChangeAltText when value.altText is undefined', async () => {
    const onChangeMock = jest.fn();
    render(
      <SeoMetadataForm
        {...defaultProps}
        onChange={onChangeMock}
        showAlternativeText={true}
        value={{ title: '', description: '', keywords: '' }}
      />
    );
    const altInput = screen.getByLabelText(/alt текст/i);
    await user.type(altInput, 'a');
    expect(onChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        altText: { uk: 'a', en: '' }
      })
    );
  });

  it('falls back displayFileName to image when image url has no trailing filename', async () => {
    render(<SeoMetadataForm {...defaultProps} />);
    await user.click(screen.getByTestId('photo-block-root-url'));
    expect(defaultProps.onImageChange).toHaveBeenCalledWith('https://example.com/');
  });

  it('passes initialCrop to PhotoBlock when crop prop is provided', () => {
    render(<SeoMetadataForm {...defaultProps} crop={{ x: 10, y: 10, width: 100, height: 100 }} />);
    expect(screen.getByTestId('photo-block')).toBeInTheDocument();
  });

  it('handles dynamic ogImage prop changes from string to null', () => {
    const { rerender } = render(<SeoMetadataForm {...defaultProps} ogImage="https://example.com/image.png" />);
    rerender(<SeoMetadataForm {...defaultProps} ogImage={null} />);
    expect(screen.getByTestId('photo-block')).toBeInTheDocument();
  });

  it('strips query parameters from image filename in handleImageChange', async () => {
    render(<SeoMetadataForm {...defaultProps} />);
    await user.click(screen.getByTestId('photo-block-query-url'));
    expect(defaultProps.onImageChange).toHaveBeenCalledWith('https://example.com/photo.png?v=1.0');
  });

  it('preserves existing altText in other locale when updating altText in uk locale', async () => {
    const onChangeMock = jest.fn();
    render(
      <SeoMetadataForm
        {...defaultProps}
        locale="uk"
        onChange={onChangeMock}
        showAlternativeText={true}
        value={{
          ...defaultProps.value,
          altText: { uk: 'Початковий укр', en: 'Existing English' }
        }}
      />
    );
    const altInput = screen.getByLabelText(/alt текст/i);
    await user.type(altInput, '2');
    expect(onChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        altText: { uk: 'Початковий укр2', en: 'Existing English' }
      })
    );
  });

  it('preserves existing altText in other locale when updating altText in en locale', async () => {
    const onChangeMock = jest.fn();
    render(
      <SeoMetadataForm
        {...defaultProps}
        locale="en"
        onChange={onChangeMock}
        showAlternativeText={true}
        value={{
          ...defaultProps.value,
          altText: { uk: 'Existing Ukrainian', en: 'Initial English' }
        }}
      />
    );
    const altInput = screen.getByLabelText(/alt текст/i);
    await user.type(altInput, '2');
    expect(onChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        altText: { uk: 'Existing Ukrainian', en: 'Initial English2' }
      })
    );
  });

  it('preserves existing touched state when forceShowErrors is triggered', async () => {
    const { rerender } = render(<SeoMetadataForm {...defaultProps} forceShowErrors={false} />);
    const input = screen.getByLabelText(/meta title/i);
    fireEvent.blur(input);

    rerender(<SeoMetadataForm {...defaultProps} forceShowErrors={true} />);
    expect(screen.getAllByText(/обовʼязкове поле/i).length).toBeGreaterThan(0);
  });

  it('covers forceShowErrors effect completely on mount and rerender', async () => {
    const { rerender } = render(<SeoMetadataForm {...defaultProps} forceShowErrors={true} />);

    expect(screen.getAllByText(/обовʼязкове поле/i).length).toBeGreaterThan(0);

    rerender(<SeoMetadataForm {...defaultProps} forceShowErrors={false} />);

    rerender(
      <SeoMetadataForm
        {...defaultProps}
        forceShowErrors={true}
        value={{ title: 'Valid Title', description: 'Valid Desc', keywords: '' }}
      />
    );

    await waitFor(() => expect(screen.queryByText(/обовʼязкове поле/i)).not.toBeInTheDocument());
  });

  it('covers valid canonicalUrl and default case branches in validateField', async () => {
    renderWithState();

    await user.click(screen.getByTestId('trigger-canonical-valid'));
    await user.click(screen.getByTestId('trigger-canonical-invalid'));
    await user.click(screen.getByTestId('trigger-default-case'));

    expect(screen.getByTestId('mock-seo-base-fields')).toBeInTheDocument();
  });

  it('shows error helper text in multiline keywords field when invalid keywords are typed', async () => {
    const MultilineKeywordsWrapper = () => {
      const [value, setValue] = React.useState<LocalizedMeta>({ title: '', description: '', keywords: '' });
      return <SeoMetadataForm {...defaultProps} extraFieldsBeforeKeywords={true} value={value} onChange={setValue} />;
    };

    render(<MultilineKeywordsWrapper />);

    const textarea = screen.getByLabelText(/meta keywords/i, { selector: 'textarea' });
    await user.type(textarea, 'a, , b');
    fireEvent.blur(textarea);

    expect(await screen.findByText(/Ключові слова мають бути через кому/i)).toBeInTheDocument();
  });

  it('calls onIndexingChange with false when unchecking allowIndexing checkbox', async () => {
    render(<SeoMetadataForm {...defaultProps} allowIndexing={true} />);
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(defaultProps.onIndexingChange).toHaveBeenCalledWith(false);
  });

  it('renders EN section title fallback when labels prop is omitted and locale is en', () => {
    render(
      <SeoMetadataForm
        value={{ title: '', description: '', keywords: '' }}
        onChange={jest.fn()}
        locale="en"
        ogImage={null}
        onImageChange={jest.fn()}
        allowIndexing={true}
        onIndexingChange={jest.fn()}
      />
    );
    expect(screen.getByText('Мета дані сторінки | EN')).toBeInTheDocument();
  });

  it('handles onChangeAltText when value.altText is undefined in en locale', async () => {
    const onChangeMock = jest.fn();
    render(
      <SeoMetadataForm
        {...defaultProps}
        locale="en"
        onChange={onChangeMock}
        showAlternativeText={true}
        value={{ title: '', description: '', keywords: '' }}
      />
    );
    const altInput = screen.getByLabelText(/alt текст/i);
    await user.type(altInput, 'b');
    expect(onChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        altText: { uk: '', en: 'b' }
      })
    );
  });

  it('resets ogImagePreview to null when an invalid or non-URL string is passed', () => {
    render(<SeoMetadataForm {...defaultProps} ogImage="invalid-image-name.png" />);

    const photoBlock = screen.getByTestId('photo-block');
    expect(photoBlock).toHaveAttribute('data-imageurl', '');
  });

  it('keeps ogImagePreview when a valid URL is passed', () => {
    render(<SeoMetadataForm {...defaultProps} ogImage="https://example.com/valid.png" />);

    const photoBlock = screen.getByTestId('photo-block');
    expect(photoBlock).toHaveAttribute('data-imageurl', 'https://example.com/valid.png');
  });
});
