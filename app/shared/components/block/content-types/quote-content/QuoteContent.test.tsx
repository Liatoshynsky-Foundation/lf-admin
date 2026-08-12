import { fireEvent, render, screen } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';

import { QuoteContent } from './QuoteContent';
import { createDocNode } from '~/__mocks__/utils';
import type { QuoteContentItem } from '~/types/blocks/contentTypes';

const updatedJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated' }] }]
};

jest.mock('~/shared/components/about-us/Liatoshynsky-office/quote-block/QuoteBlock', () => ({
  QuoteBlock: ({
    onTitleChange,
    onDescriptionChange
  }: {
    onTitleChange: (value: JSONContent) => void;
    onDescriptionChange: (value: JSONContent) => void;
  }) => (
    <div>
      <button data-testid="trigger-source-change" onClick={() => onTitleChange(updatedJson)}>
        Change source
      </button>
      <button data-testid="trigger-text-change" onClick={() => onDescriptionChange(updatedJson)}>
        Change text
      </button>
    </div>
  )
}));

const baseItem: QuoteContentItem = {
  id: 'quote-1',
  type: 'quote',
  source: { uk: createDocNode('Джерело UK'), en: createDocNode('Source EN') },
  text: { uk: createDocNode('Цитата UK'), en: createDocNode('Quote EN') }
};

describe('QuoteContent', () => {
  it('should update source on title change', () => {
    const onChange = jest.fn();

    render(<QuoteContent item={baseItem} locale="uk" onChange={onChange} pageId="about-us" blockId="office" />);

    fireEvent.click(screen.getByTestId('trigger-source-change'));

    expect(onChange).toHaveBeenCalledWith({
      ...baseItem,
      source: {
        ...baseItem.source,
        uk: updatedJson
      }
    });
  });

  it('should update text on description change', () => {
    const onChange = jest.fn();

    render(<QuoteContent item={baseItem} locale="en" onChange={onChange} pageId="about-us" blockId="office" />);

    fireEvent.click(screen.getByTestId('trigger-text-change'));

    expect(onChange).toHaveBeenCalledWith({
      ...baseItem,
      text: {
        ...baseItem.text,
        en: updatedJson
      }
    });
  });
});
