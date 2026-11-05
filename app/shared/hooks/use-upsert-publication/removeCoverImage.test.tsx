import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ComponentProps, useEffect, useState } from 'react';

import { usePublicationForm, validatePublicationSeo } from './usePublicationForm';
import { initialSeoValue } from '~/constants/publications';
import { normalizeFetchedCrop } from '~/lib/utils/CropperHelper';
import SeoMetadataBlock from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import type { MediaModal } from '~/shared/components/media-modal/MediaModal';

jest.mock('~/public/icons/image.svg', () => ({ __esModule: true, default: () => <span /> }));
jest.mock('~/public/icons/pencil.svg', () => ({ __esModule: true, default: () => <span /> }));

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  MediaModal: ({ open, onApply }: ComponentProps<typeof MediaModal>) =>
    open ? (
      <button
        onClick={() =>
          onApply({
            selected: { kind: 'gallery', id: 'new', fileName: 'new.jpg', src: 'https://example.com/new.jpg', locale: 'uk' },
            crop: null
          })
        }
      >
        Select new image
      </button>
    ) : null
}));

jest.mock('~/shared/hooks/use-image-metadata/useImageMetadata', () => ({
  useImageMetadata: () => ({ fileName: 'event.jpg' })
}));

const initialCrop = { x: 10, y: 10, width: 80, height: 60 };
const seoValue = {
  ...initialSeoValue,
  ogImage: 'https://example.com/event.jpg',
  meta: {
    uk: { ...initialSeoValue.meta.uk, title: 'Подія', altText: { uk: 'Фото', en: 'Photo' } },
    en: { ...initialSeoValue.meta.en, title: 'Event', altText: { uk: 'Фото', en: 'Photo' } }
  }
};

function EventImageForm() {
  const form = usePublicationForm();
  const { setSeoValue, setCrop, setInitialState } = form;
  const [payload, setPayload] = useState('');

  useEffect(() => {
    setSeoValue(seoValue);
    setCrop({ uk: initialCrop, en: initialCrop });
    setInitialState({ adminTitle: '', publishDate: null, seoValue, crop: { uk: initialCrop, en: initialCrop } });
  }, [setSeoValue, setCrop, setInitialState]);

  return (
    <>
      <SeoMetadataBlock
        value={form.seoValue}
        onChange={form.setSeoValue}
        onRemoveImage={form.removeCoverImage}
        showAlternativeText
        crop={normalizeFetchedCrop(form.crop)}
        onChangeCrop={form.setCrop}
      />
      <span data-testid="dirty">{String(form.hasUnsavedChanges)}</span>
      <button onClick={() => setPayload(JSON.stringify(form.buildCommonInput().coverImage))}>Build save payload</button>
      <pre data-testid="payload">{payload}</pre>
      <span data-testid="alt-errors">{validatePublicationSeo(form.seoValue, 'events').seoErrors.meta.uk.altText}</span>
    </>
  );
}

describe('event preview image removal', () => {
  it.each(['Видалити', 'Delete'])('clears both locales and the save payload using %s', async (label) => {
    render(<EventImageForm />);
    expect(screen.getByTestId('dirty')).toHaveTextContent('false');
    fireEvent.click(screen.getByRole('button', { name: label }));

    await waitFor(() => expect(screen.getAllByTestId('cloud-upload-icon')).toHaveLength(2));
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.getByTestId('dirty')).toHaveTextContent('true');
    expect(screen.getByTestId('alt-errors')).toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole('button', { name: 'Build save payload' }));
    expect(JSON.parse(screen.getByTestId('payload').textContent || '{}')).toEqual({
      src: '', alt: { uk: '', en: '' }, caption: { uk: '', en: '' }
    });
  });

  it('allows selecting another image after removal without restoring the previous crop', async () => {
    render(<EventImageForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.getAllByTestId('cloud-upload-icon')).toHaveLength(2));
    fireEvent.click(screen.getAllByRole('button', { name: 'Змінити зображення' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Select new image' }));

    await waitFor(() => expect(screen.getAllByAltText('Selected')).toHaveLength(2));
    fireEvent.click(screen.getByRole('button', { name: 'Build save payload' }));
    expect(JSON.parse(screen.getByTestId('payload').textContent || '{}')).toEqual({
      src: 'https://example.com/new.jpg', alt: { uk: '', en: '' }, caption: { uk: '', en: '' }
    });
  });
});
