import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createPageSection } from './pageSection.utils';
import { PageSectionsEditor } from './PageSectionsEditor';

jest.mock('~/shared/hooks/use-managed-page-sections/useManagedPageSections', () => ({
  useManagedPageSections: () => {
    const [sections, setSections] = React.useState<ReturnType<typeof createPageSection>[]>([]);

    return {
      sections,
      addSection: () => setSections((current) => [...current, createPageSection()]),
      updateSection: (next: ReturnType<typeof createPageSection>) =>
        setSections((current) => current.map((section) => (section.id === next.id ? next : section))),
      removeSection: (sectionId: string) =>
        setSections((current) => current.filter((section) => section.id !== sectionId)),
      reorderSections: (reordered: ReturnType<typeof createPageSection>[]) => setSections(reordered)
    };
  }
}));

jest.mock('~/public/icons/trash.svg', () => {
  const TrashIcon = () => <svg data-testid="trash-icon" />;
  TrashIcon.displayName = 'TrashIcon';
  return TrashIcon;
});
jest.mock('~/shared/components/design-system/collapsible-block/CollapsibleBlock');
jest.mock('~/shared/components/design-system/text-field/TextField');
jest.mock('~/shared/components/sortable-item-wrapper/SortableItemWrapper', () => ({
  SortableItemWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));
jest.mock('~/shared/components/sortable-list/SortableList', () => ({
  SortableList: ({
    children,
    items,
    onDragEnd
  }: {
    children: React.ReactNode;
    items?: string[];
    onDragEnd?: (event: { active: { id: string }; over: { id: string } }) => void;
  }) => (
    <div data-testid="mock-sortable-list">
      {children}
      <button
        type="button"
        data-testid="trigger-drag"
        onClick={() =>
          onDragEnd?.({
            active: { id: items?.[0] ?? '' },
            over: { id: items?.[1] ?? '' }
          })
        }
      >
        Drag
      </button>
    </div>
  )
}));

const sectionHeadings = () => screen.getAllByRole('heading').map((heading) => heading.textContent);

const renderEditor = () => render(<PageSectionsEditor pageSlug="about-us" />);

describe('PageSectionsEditor', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  const addSection = () => user.click(screen.getByRole('button', { name: 'Додати секцію' }));

  it('should show only the add button until a section is created', async () => {
    renderEditor();

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Додати секцію' })).toBeInTheDocument();

    await addSection();

    expect(sectionHeadings()).toEqual(['Перша секція']);

    await addSection();

    expect(sectionHeadings()).toEqual(['Перша секція', 'Друга секція']);
  });

  it('should edit the section title with the same field as other sections', async () => {
    renderEditor();
    await addSection();

    await user.click(screen.getByTestId('trigger-change-Заголовок секції'));

    expect(screen.getByTestId('textfield-json-Заголовок секції')).toHaveTextContent('Updated Заголовок секції');
    expect(sectionHeadings()).toEqual(['Updated Заголовок секції']);
  });

  it('should add a subtitle, a paragraph and a bullet, then remove the paragraph', async () => {
    renderEditor();
    await addSection();

    await user.click(screen.getByRole('button', { name: 'Додати підзаголовок' }));
    await user.click(screen.getByRole('button', { name: 'Додати абзац' }));
    await user.click(screen.getByRole('button', { name: 'Додати елемент маркованого списку' }));

    expect(screen.getByTestId('textfield-wrapper-Підзаголовок')).toBeInTheDocument();
    expect(screen.getByTestId('textfield-wrapper-Абзац')).toBeInTheDocument();
    expect(screen.getByTestId('textfield-wrapper-Елемент маркованого списку')).toBeInTheDocument();

    const paragraph = screen.getByTestId('textfield-wrapper-Абзац').parentElement?.parentElement;
    if (!paragraph) throw new Error('Paragraph row was not rendered');

    await user.click(within(paragraph).getByRole('button', { name: 'Видалити' }));

    expect(screen.queryByTestId('textfield-wrapper-Абзац')).not.toBeInTheDocument();
    expect(screen.getByTestId('textfield-wrapper-Підзаголовок')).toBeInTheDocument();
  });

  it('should edit a paragraph with the same field used in other sections', async () => {
    renderEditor();
    await addSection();

    await user.click(screen.getByRole('button', { name: 'Додати абзац' }));
    await user.click(screen.getByTestId('trigger-change-Абзац'));

    expect(screen.getByTestId('textfield-json-Абзац')).toHaveTextContent('Updated Абзац');
  });

  it('should delete a section and reorder the remaining ones by drag', async () => {
    renderEditor();
    await addSection();

    await addSection();

    await user.click(screen.getAllByTestId('trigger-change-Заголовок секції')[1]);

    await user.click(screen.getAllByRole('button', { name: 'Видалити секцію' })[0]);

    expect(screen.getAllByTestId('textfield-json-Заголовок секції')).toHaveLength(1);
    expect(screen.getByTestId('textfield-json-Заголовок секції')).toHaveTextContent('Updated Заголовок секції');
    expect(sectionHeadings()).toEqual(['Updated Заголовок секції']);

    await addSection();

    await user.click(screen.getAllByTestId('trigger-drag')[0]);

    const reordered = screen.getAllByTestId('textfield-json-Заголовок секції');
    expect(reordered[0]).not.toHaveTextContent('Updated Заголовок секції');
    expect(reordered[1]).toHaveTextContent('Updated Заголовок секції');
  });

  it('should show only the add button after the last section is removed', async () => {
    renderEditor();
    await addSection();

    await user.click(screen.getByRole('button', { name: 'Видалити секцію' }));

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Додати секцію' })).toBeInTheDocument();
  });

  it('should reorder content items inside a section', async () => {
    renderEditor();
    await addSection();

    await user.click(screen.getByRole('button', { name: 'Додати підзаголовок' }));
    await user.click(screen.getByRole('button', { name: 'Додати абзац' }));

    await user.click(screen.getAllByTestId('trigger-drag')[0]);

    const fields = screen
      .getAllByTestId(/textfield-wrapper-/)
      .filter((field) => field.getAttribute('data-testid') !== 'textfield-wrapper-Заголовок секції');
    expect(fields[0]).toHaveAttribute('data-testid', 'textfield-wrapper-Абзац');
    expect(fields[1]).toHaveAttribute('data-testid', 'textfield-wrapper-Підзаголовок');
  });
});
