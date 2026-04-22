import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

import SeoCollapsibleBlock from './SeoCollapsibleBlock';

jest.mock(
  '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock',
  () => ({
    __esModule: true,
    default: ({
      showAlternativeText,
      showTicketUrl
    }: {
      showAlternativeText?: boolean;
      showTicketUrl?: boolean;
    }) => (
      <div
        data-testid="seo-metadata-block"
        data-show-alt={String(showAlternativeText)}
        data-show-ticket={String(showTicketUrl)}
      />
    )
  })
);

const defaultProps = {
  title: 'Деталі',
  children: <span data-testid="child-content">content</span>
};

describe('SeoCollapsibleBlock', () => {
  it('renders CollapsibleBlock with correct title', () => {
    render(<SeoCollapsibleBlock {...defaultProps} />);
    expect(screen.getByText('Деталі')).toBeInTheDocument();
  });

  it('renders children inside CollapsibleBlock', () => {
    render(<SeoCollapsibleBlock {...defaultProps} />);
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders SeoMetadataBlock', () => {
    render(<SeoCollapsibleBlock {...defaultProps} />);
    expect(screen.getByTestId('seo-metadata-block')).toBeInTheDocument();
  });

  it('passes defaultExpanded to CollapsibleBlock', () => {
    render(<SeoCollapsibleBlock {...defaultProps} defaultExpanded />);
    expect(screen.getByText('Деталі')).toBeInTheDocument();
  });

  it('passes showAlternativeText to SeoMetadataBlock', () => {
    render(<SeoCollapsibleBlock {...defaultProps} showAlternativeText />);
    expect(screen.getByTestId('seo-metadata-block')).toHaveAttribute(
      'data-show-alt',
      'true'
    );
  });

  it('passes showTicketUrl to SeoMetadataBlock', () => {
    render(<SeoCollapsibleBlock {...defaultProps} showTicketUrl />);
    expect(screen.getByTestId('seo-metadata-block')).toHaveAttribute(
      'data-show-ticket',
      'true'
    );
  });
});
