import { fireEvent, render, screen, within } from '@testing-library/react';

import { PageSectionsEditor } from './PageSectionsEditor';

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

const addSection = () => fireEvent.click(screen.getByRole('button', { name: 'Додати секцію' }));

describe('PageSectionsEditor', () => {
  it('should show only the add button until a section is created', () => {
    render(<PageSectionsEditor />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Додати секцію' })).toBeInTheDocument();

    addSection();

    expect(sectionHeadings()).toEqual(['Перша секція']);

    addSection();

    expect(sectionHeadings()).toEqual(['Перша секція', 'Друга секція']);
  });

  it('should keep a typed title on the current locale', () => {
    render(<PageSectionsEditor />);
    addSection();

    fireEvent.change(screen.getByPlaceholderText('Додайте заголовок'), { target: { value: 'Історія фонду' } });

    expect(screen.getByPlaceholderText('Додайте заголовок')).toHaveValue('Історія фонду');
  });

  it('should add a subtitle, a paragraph and a bullet, then remove the paragraph', () => {
    render(<PageSectionsEditor />);
    addSection();

    fireEvent.click(screen.getByRole('button', { name: 'Додати підзаголовок' }));
    fireEvent.click(screen.getByRole('button', { name: 'Додати абзац' }));
    fireEvent.click(screen.getByRole('button', { name: 'Додати елемент маркованого списку' }));

    expect(screen.getByTestId('textfield-wrapper-Підзаголовок')).toBeInTheDocument();
    expect(screen.getByTestId('textfield-wrapper-Абзац')).toBeInTheDocument();
    expect(screen.getByTestId('textfield-wrapper-Елемент маркованого списку')).toBeInTheDocument();

    const paragraph = screen.getByTestId('textfield-wrapper-Абзац').parentElement?.parentElement;
    if (!paragraph) throw new Error('Paragraph row was not rendered');

    fireEvent.click(within(paragraph).getByRole('button', { name: 'Видалити' }));

    expect(screen.queryByTestId('textfield-wrapper-Абзац')).not.toBeInTheDocument();
    expect(screen.getByTestId('textfield-wrapper-Підзаголовок')).toBeInTheDocument();
  });

  it('should edit a paragraph with the same field used in other sections', () => {
    render(<PageSectionsEditor />);
    addSection();

    fireEvent.click(screen.getByRole('button', { name: 'Додати абзац' }));
    fireEvent.click(screen.getByTestId('trigger-change-Абзац'));

    expect(screen.getByTestId('textfield-json-Абзац')).toHaveTextContent('Updated Абзац');
  });

  it('should delete a section and reorder the remaining ones by drag', () => {
    render(<PageSectionsEditor />);
    addSection();

    fireEvent.change(screen.getByPlaceholderText('Додайте заголовок'), { target: { value: 'Перша' } });
    addSection();

    const titles = screen.getAllByPlaceholderText('Додайте заголовок');
    fireEvent.change(titles[1], { target: { value: 'Друга' } });

    fireEvent.click(screen.getAllByRole('button', { name: 'Видалити секцію' })[0]);

    expect(screen.getAllByPlaceholderText('Додайте заголовок')).toHaveLength(1);
    expect(screen.getByPlaceholderText('Додайте заголовок')).toHaveValue('Друга');
    expect(sectionHeadings()).toEqual(['Перша секція']);

    addSection();
    fireEvent.change(screen.getAllByPlaceholderText('Додайте заголовок')[1], { target: { value: 'Третя' } });

    fireEvent.click(screen.getAllByTestId('trigger-drag')[0]);

    const reordered = screen.getAllByPlaceholderText('Додайте заголовок');
    expect(reordered[0]).toHaveValue('Третя');
    expect(reordered[1]).toHaveValue('Друга');
  });

  it('should show only the add button after the last section is removed', () => {
    render(<PageSectionsEditor />);
    addSection();

    fireEvent.click(screen.getByRole('button', { name: 'Видалити секцію' }));

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Додати секцію' })).toBeInTheDocument();
  });

  it('should reorder content items inside a section', () => {
    render(<PageSectionsEditor />);
    addSection();

    fireEvent.click(screen.getByRole('button', { name: 'Додати підзаголовок' }));
    fireEvent.click(screen.getByRole('button', { name: 'Додати абзац' }));

    fireEvent.click(screen.getAllByTestId('trigger-drag')[0]);

    const fields = screen.getAllByTestId(/textfield-wrapper-/);
    expect(fields[0]).toHaveAttribute('data-testid', 'textfield-wrapper-Абзац');
    expect(fields[1]).toHaveAttribute('data-testid', 'textfield-wrapper-Підзаголовок');
  });
});
