import { render, screen } from '@testing-library/react';
import React from 'react';

import BiographyPageContent from './page';

jest.mock('~/shared/components/editable-page-layout/EditablePageLayout', () => ({
  EditablePageLayout: ({
    pageSlug,
    headerTitle,
    children
  }: {
    pageSlug: string;
    headerTitle: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="editable-page-layout" data-page-slug={pageSlug}>
      <h1>{headerTitle}</h1>
      {children}
    </div>
  )
}));

describe('BiographyPageContent', () => {
  it('opens the editable page layout for the biography page', () => {
    render(<BiographyPageContent />);

    expect(screen.getByTestId('editable-page-layout')).toHaveAttribute('data-page-slug', 'biography');
    expect(screen.getByRole('heading', { name: 'Біографія' })).toBeInTheDocument();
  });

  it('shows that the biography blocks editor is in development', () => {
    render(<BiographyPageContent />);

    expect(screen.getByTestId('biography-editor-placeholder')).toHaveTextContent('Редактор біографії в розробці');
  });
});
