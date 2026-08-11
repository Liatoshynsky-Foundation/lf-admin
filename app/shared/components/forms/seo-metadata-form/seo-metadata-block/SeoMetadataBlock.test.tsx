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
    onChangeCrop,
    extraFields,
    required
  }: {
    locale: string;
    value: { title: string; description: string; keywords: string };
    ogImage: string | null;
    allowIndexing: boolean;
    onChange: (meta: object) => void;
    onImageChange: (url: string) => void;
    onIndexingChange: (val: boolean) => void;
    onChangeCrop?: (crop: object | null) => void;
    extraFields?: (value: object, onChange: (val: object) => void) => React.ReactNode;
    required?: boolean;
  }) => (
    <div>
      <span data-testid={`locale-${locale}`}>{locale}</span>
      <span data-testid={`title-${locale}`}>{value?.title}</span>
      <span data-testid={`og-image-${locale}`}>{ogImage ? 'has-image' : 'no-image'}</span>
      <span data-testid={`indexing-${locale}`}>{String(allowIndexing)}</span>
      <span data-testid={`required-${locale}`}>{String(required ?? true)}</span>
      <button onClick={() => onChange({ title: 'test', description: 'desc', keywords: 'kw' })}>change-{locale}</button>
      <button onClick={() => onImageChange('https://example.com/test.png')}>image-{locale}</button>
      <button onClick={() => onIndexingChange(false)}>indexing-{locale}</button>
      <button onClick={() => onChangeCrop?.({ x: 10 })}>crop-{locale}</button>
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

  it('passes optional validation mode to both locale forms', () => {
    renderBlock({ required: false });

    locales.forEach((locale) => {
      expect(screen.getByTestId(`required-${locale}`)).toHaveTextContent('false');
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

  it('triggers forceShowErrors effect for ticketUrl in both locales', () => {
    renderBlock({ showTicketUrl: true, forceShowErrors: true });
    expect(screen.getByText('Обовʼязкове поле')).toBeInTheDocument();
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('triggers forceShowErrors effect when ticketUrl has pre-existing valid/invalid values', () => {
    renderBlock({
      showTicketUrl: true,
      forceShowErrors: true,
      onChange: jest.fn(),
      value: {
        ...controlledValue,
        ticketUrl: { uk: 'https://valid.com', en: 'invalid-url' }
      }
    });
    expect(screen.getByText('Invalid URL')).toBeInTheDocument();
  });

  it('handles onChangeCrop when only one locale crop is provided in prop', () => {
    const onChangeCropMock = jest.fn();
    renderBlock({
      crop: { uk: { x: 1, y: 1, width: 10, height: 10 } },
      onChangeCrop: onChangeCropMock
    });

    clickButton('crop-uk');
    expect(onChangeCropMock).toHaveBeenCalledWith({
      uk: { x: 10 },
      en: null
    });

    clickButton('crop-en');
    expect(onChangeCropMock).toHaveBeenCalledWith({
      uk: { x: 1, y: 1, width: 10, height: 10 },
      en: { x: 10 }
    });
  });

  it('handles onChangeCrop for uk and en locales when crop prop is provided', () => {
    const onChangeCropMock = jest.fn();
    renderBlock({
      crop: { uk: { x: 1, y: 1, width: 10, height: 10 }, en: { x: 2, y: 2, width: 20, height: 20 } },
      onChangeCrop: onChangeCropMock
    });

    clickButton('crop-uk');
    expect(onChangeCropMock).toHaveBeenCalledWith({
      uk: { x: 10 },
      en: { x: 2, y: 2, width: 20, height: 20 }
    });

    clickButton('crop-en');
    expect(onChangeCropMock).toHaveBeenCalledWith({
      uk: { x: 1, y: 1, width: 10, height: 10 },
      en: { x: 10 }
    });
  });

  it('handles onChangeCrop when crop prop is omitted or null', () => {
    const onChangeCropMock = jest.fn();
    renderBlock({ onChangeCrop: onChangeCropMock });

    clickButton('crop-uk');
    expect(onChangeCropMock).toHaveBeenCalledWith({
      uk: { x: 10 },
      en: null
    });

    clickButton('crop-en');
    expect(onChangeCropMock).toHaveBeenCalledWith({
      uk: null,
      en: { x: 10 }
    });
  });

  it('handles ticketUrl change when ticketUrl object is initial undefined', async () => {
    const user = userEvent.setup();
    renderBlock({ showTicketUrl: true });
    const inputs = screen.getAllByLabelText(/ticket url/i);

    fireEvent.blur(inputs[0]);
    await user.type(inputs[0], 'https://test.com');

    expect(screen.queryByText(/обовʼязкове поле/i)).not.toBeInTheDocument();
  });

  it('uses externalOnChange in controlled mode when uk image changes', () => {
    const onChange = jest.fn();
    renderBlock({ value: controlledValue, onChange });
    clickButton('image-uk');
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ogImage: 'https://example.com/test.png'
      })
    );
  });
  it('handles typing and blurring ticketUrl in en locale when uk ticketUrl is defined', () => {
    const onChangeMock = jest.fn();
    renderBlock({
      showTicketUrl: true,
      value: {
        ...controlledValue,
        ticketUrl: { uk: 'https://uk-tickets.com', en: '' }
      },
      onChange: onChangeMock
    });

    const inputs = screen.getAllByLabelText(/ticket url/i);
    fireEvent.change(inputs[1], { target: { value: 'https://en-tickets.com' } });
    fireEvent.blur(inputs[1]);

    expect(onChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketUrl: { uk: 'https://uk-tickets.com', en: 'https://en-tickets.com' }
      })
    );
  });

  it('handles forceShowErrors when only one locale ticketUrl is defined', () => {
    renderBlock({
      showTicketUrl: true,
      forceShowErrors: true,
      onChange: jest.fn(),
      value: {
        ...controlledValue,
        ticketUrl: { uk: 'https://valid-uk.com', en: '' }
      }
    });
    expect(screen.getByText('Required field')).toBeInTheDocument();

    renderBlock({
      showTicketUrl: true,
      forceShowErrors: true,
      onChange: jest.fn(),
      value: {
        ...controlledValue,
        ticketUrl: { uk: '', en: 'https://valid-en.com' }
      }
    });
    expect(screen.getByText('Обовʼязкове поле')).toBeInTheDocument();
  });

  it('renders ticketUrl fields cleanly when value.ticketUrl is undefined', () => {
    renderBlock({
      showTicketUrl: true,
      onChange: jest.fn(),
      value: {
        meta: controlledValue.meta,
        ogImage: null,
        allowIndexing: { uk: true, en: true }
      }
    });
    const inputs = screen.getAllByLabelText(/ticket url/i);
    expect(inputs).toHaveLength(2);
  });

  it('handles re-validation on ticketUrl change when field is already touched', () => {
    const onChangeMock = jest.fn();
    renderBlock({
      showTicketUrl: true,
      value: {
        ...controlledValue,
        ticketUrl: { uk: '', en: '' }
      },
      onChange: onChangeMock
    });

    const inputs = screen.getAllByLabelText(/ticket url/i);

    fireEvent.blur(inputs[0]);
    fireEvent.change(inputs[0], { target: { value: 'https://uk-valid.com' } });

    fireEvent.blur(inputs[1]);
    fireEvent.change(inputs[1], { target: { value: 'https://en-valid.com' } });

    expect(onChangeMock).toHaveBeenCalled();
  });

  it('handles handleTicketUrlChange and handleTicketUrlBlur when value.ticketUrl is undefined', () => {
    const onChangeMock = jest.fn();
    renderBlock({
      showTicketUrl: true,
      value: {
        meta: controlledValue.meta,
        ogImage: null,
        allowIndexing: { uk: true, en: true }
      },
      onChange: onChangeMock
    });

    const inputs = screen.getAllByLabelText(/ticket url/i);

    fireEvent.blur(inputs[0]);
    fireEvent.blur(inputs[1]);

    fireEvent.change(inputs[0], { target: { value: 'https://new-uk.com' } });

    expect(onChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketUrl: { uk: 'https://new-uk.com', en: '' }
      })
    );
  });

  it('handles forceShowErrors when ticketUrl has valid URLs in both locales', () => {
    renderBlock({
      showTicketUrl: true,
      forceShowErrors: true,
      onChange: jest.fn(),
      value: {
        ...controlledValue,
        ticketUrl: { uk: 'https://valid-uk.com', en: 'https://valid-en.com' }
      }
    });
    expect(screen.queryByText('Обовʼязкове поле')).not.toBeInTheDocument();
    expect(screen.queryByText('Required field')).not.toBeInTheDocument();
  });

  it('handles forceShowErrors when uk ticketUrl is invalid and en ticketUrl is valid', () => {
    renderBlock({
      showTicketUrl: true,
      forceShowErrors: true,
      onChange: jest.fn(),
      value: {
        ...controlledValue,
        ticketUrl: { uk: 'invalid-url', en: 'https://valid-en.com' }
      }
    });
    expect(screen.getByText('Некоректний URL')).toBeInTheDocument();
    expect(screen.queryByText('Invalid URL')).not.toBeInTheDocument();
  });

  it('handles forceShowErrors when one locale ticketUrl is undefined in ticketUrl object', () => {
    renderBlock({
      showTicketUrl: true,
      forceShowErrors: true,
      onChange: jest.fn(),
      value: {
        meta: controlledValue.meta,
        ogImage: null,
        allowIndexing: { uk: true, en: true },
        ticketUrl: { uk: 'https://valid-uk.com' } as { uk: string; en: string }
      }
    });
    expect(screen.getByText('Required field')).toBeInTheDocument();

    renderBlock({
      showTicketUrl: true,
      forceShowErrors: true,
      onChange: jest.fn(),
      value: {
        meta: controlledValue.meta,
        ogImage: null,
        allowIndexing: { uk: true, en: true },
        ticketUrl: { en: 'https://valid-en.com' } as { uk: string; en: string }
      }
    });
    expect(screen.getByText('Обовʼязкове поле')).toBeInTheDocument();
  });
});
