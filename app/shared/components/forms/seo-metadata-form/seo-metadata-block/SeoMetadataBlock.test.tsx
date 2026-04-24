import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import SeoMetadataBlock, { SeoBlockValue } from './SeoMetadataBlock';

jest.mock('../SeoMetadataForm', () => ({
  __esModule: true,
  default: ({
    locale,
    value,
    ogImage,
    allowIndexing,
    onChange,
    onImageChange,
    onIndexingChange,
    extraFields
  }: {
    locale: string;
    value: { title: string; description: string; keywords: string };
    ogImage: string | null;
    allowIndexing: boolean;
    onChange: (meta: object) => void;
    onImageChange: (url: string) => void;
    onIndexingChange: (val: boolean) => void;
    extraFields?: (value: object, onChange: (val: object) => void) => React.ReactNode;
  }) => (
    <div>
      <span data-testid={`locale-${locale}`}>{locale}</span>
      <span data-testid={`title-${locale}`}>{value?.title}</span>
      <span data-testid={`og-image-${locale}`}>{ogImage ? 'has-image' : 'no-image'}</span>
      <span data-testid={`indexing-${locale}`}>{String(allowIndexing)}</span>
      <button onClick={() => onChange({ title: 'test', description: 'desc', keywords: 'kw' })}>change-{locale}</button>
      <button onClick={() => onImageChange('https://example.com/test.png')}>image-{locale}</button>
      <button onClick={() => onIndexingChange(false)}>indexing-{locale}</button>
      {extraFields && <div data-testid={`extra-${locale}`}>{extraFields(value, onChange)}</div>}
    </div>
  )
}));

const locales = ['uk', 'en'] as const;

describe('SeoMetadataBlock', () => {
  const renderBlock = (props = {}) => render(<SeoMetadataBlock {...props} />);
  const clickButton = (text: string) => fireEvent.click(screen.getByText(text));

  const controlledValue: SeoBlockValue = {
    meta: {
      uk: { title: '', description: '', keywords: '' },
      en: { title: '', description: '', keywords: '' }
    },
    ogImage: null,
    allowIndexing: { uk: true, en: true }
  };

  it('renders two forms for uk and en locales', () => {
    renderBlock();
    locales.forEach((locale) => {
      expect(screen.getByTestId(`locale-${locale}`)).toBeInTheDocument();
    });
  });

  test.each(locales)('updates %s meta on change in uncontrolled mode', (locale) => {
    renderBlock();
    clickButton(`change-${locale}`);
    expect(screen.getByTestId(`title-${locale}`)).toHaveTextContent('test');
  });

  test.each(locales)('updates %s allowIndexing in uncontrolled mode', (locale) => {
    renderBlock();
    clickButton(`indexing-${locale}`);
    expect(screen.getByTestId(`indexing-${locale}`)).toHaveTextContent('false');
  });

  it('uses externalOnChange in controlled mode when meta changes', () => {
    const onChange = jest.fn();
    renderBlock({ value: controlledValue, onChange });
    clickButton('change-uk');
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          uk: expect.objectContaining({ title: 'test' })
        })
      })
    );
  });

  it('uses externalOnChange in controlled mode when image changes', () => {
    const onChange = jest.fn();
    renderBlock({ value: controlledValue, onChange });
    clickButton('image-en');
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ogImage: 'https://example.com/test.png'
      })
    );
  });

  it('uses externalOnChange in controlled mode when indexing changes', () => {
    const onChange = jest.fn();
    renderBlock({ value: controlledValue, onChange });
    clickButton('indexing-uk');
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        allowIndexing: expect.objectContaining({ uk: false })
      })
    );
  });

  it('renders extraFields for both locales when provided', () => {
    renderBlock({ extraFields: (locale: string) => <span>extra-{locale}</span> });
    locales.forEach((locale) => {
      expect(screen.getByTestId(`extra-${locale}`)).toBeInTheDocument();
    });
  });

  it('does not render extraFields when not provided', () => {
    renderBlock();
    locales.forEach((locale) => {
      expect(screen.queryByTestId(`extra-${locale}`)).not.toBeInTheDocument();
    });
  });

  it('shows required error for empty ticket url on blur', async () => {
    const user = userEvent.setup();
    renderBlock({ showTicketUrl: true });
    const inputs = screen.getAllByLabelText(/ticket url/i);
    await user.click(inputs[0]);
    await user.tab();
    expect(await screen.findByText(/обовʼязкове поле/i)).toBeInTheDocument();
  });

  it('shows url format error for invalid ticket url', async () => {
    const user = userEvent.setup();
    renderBlock({ showTicketUrl: true });
    const inputs = screen.getAllByLabelText(/ticket url/i);
    await user.type(inputs[0], 'bad-url');
    await user.tab();
    expect(await screen.findByText(/некоректний url/i)).toBeInTheDocument();
  });

  it('shows no error for valid ticket url', async () => {
    const user = userEvent.setup();
    renderBlock({ showTicketUrl: true });
    const inputs = screen.getAllByLabelText(/ticket url/i);
    await user.type(inputs[0], 'https://tickets.example.com');
    await user.tab();
    expect(screen.queryByText(/некоректний url/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/обовʼязкове поле/i)).not.toBeInTheDocument();
  });
});
