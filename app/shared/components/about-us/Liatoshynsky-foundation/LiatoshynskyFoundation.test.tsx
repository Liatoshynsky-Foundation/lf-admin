import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LiatoshynskyFoundation } from './LiatoshynskyFoundation';
import { hardcodedData } from './LiatoshynskyFoundation.const';

jest.mock('../../design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="collapsible-block">
      <h2>{title}</h2>
      {children}
    </div>
  )
}));

jest.mock('../../design-system/photo-block/PhotoBlock', () => ({
  __esModule: true,
  ImagePreviewBlock: () => <div data-testid="image-preview-block" />
}));

describe('LiatoshynskyFoundation', () => {
  it('should render with main text and paragraphs', () => {
    render(<LiatoshynskyFoundation />);
    expect(screen.getByText('Фундація Лятошинського')).toBeInTheDocument();

    expect(screen.getByText('Основний текст секції')).toBeInTheDocument();

    hardcodedData.paragraphs.forEach((paragraph) => {
      expect(screen.getByDisplayValue(paragraph)).toBeInTheDocument();
    });
  });

  it('should update paragraph text when user types in paragraph textarea', async () => {
    render(<LiatoshynskyFoundation />);
    const user = userEvent.setup();

    const paragraphBlock = screen.getByText('Текст 2 абзацу').parentElement!;
    const paragraphArea = within(paragraphBlock).getByRole('textbox');

    await user.clear(paragraphArea);
    await user.type(paragraphArea, 'Some text');

    expect(paragraphArea).toHaveValue('Some text');
  });
});
