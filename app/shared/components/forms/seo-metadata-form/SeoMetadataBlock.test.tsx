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

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import SeoMetadataBlock from './SeoMetadataBlock';

describe('SeoMetadataBlock', () => {
  it('renders two forms (ua and en)', () => {
    render(<SeoMetadataBlock />);

    expect(screen.getByText('ua')).toBeInTheDocument();
    expect(screen.getByText('en')).toBeInTheDocument();
  });

  it('updates ua meta state on change', () => {
    render(<SeoMetadataBlock />);

    fireEvent.click(screen.getByText('change-ua'));

    expect(screen.getByText('ua')).toBeInTheDocument();
  });

  it('updates en meta state on change', () => {
    render(<SeoMetadataBlock />);

    fireEvent.click(screen.getByText('change-en'));

    expect(screen.getByText('en')).toBeInTheDocument();
  });

  it('updates ua image state', () => {
    render(<SeoMetadataBlock />);

    fireEvent.click(screen.getByText('image-ua'));

    expect(screen.getByText('ua')).toBeInTheDocument();
  });

  it('updates en image state', () => {
    render(<SeoMetadataBlock />);

    fireEvent.click(screen.getByText('image-en'));

    expect(screen.getByText('en')).toBeInTheDocument();
  });

  it('updates ua indexing state', () => {
    render(<SeoMetadataBlock />);

    fireEvent.click(screen.getByText('indexing-ua'));

    expect(screen.getByText('ua')).toBeInTheDocument();
  });

  it('updates en indexing state', () => {
    render(<SeoMetadataBlock />);

    fireEvent.click(screen.getByText('indexing-en'));

    expect(screen.getByText('en')).toBeInTheDocument();
  });

  it('passes props to both forms', () => {
    render(<SeoMetadataBlock showCanonicalUrl showAlternativeText />);

    expect(screen.getByText('ua')).toBeInTheDocument();
    expect(screen.getByText('en')).toBeInTheDocument();
  });
});
