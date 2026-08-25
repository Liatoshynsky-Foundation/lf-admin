import { fireEvent, render, screen } from '@testing-library/react';

import { ParagraphContent } from './ParagraphContent';
import { createDocNode } from '~/__mocks__/utils';
import type { ParagraphContentItem } from '~/types/blocks/contentTypes';

jest.mock('~/shared/components/design-system/text-field/TextField');

const baseItem: ParagraphContentItem = {
  id: 'paragraph-1',
  type: 'paragraph',
  value: { uk: createDocNode('Текст UK'), en: createDocNode('Text EN') }
};

const renderComponent = (overrides?: Partial<ParagraphContentItem>) => {
  const onChange = jest.fn();

  render(
    <ParagraphContent
      item={{ ...baseItem, ...overrides }}
      locale="uk"
      onChange={onChange}
      pageId="about-us"
      blockId="mission"
    />
  );

  return { onChange };
};

describe('ParagraphContent', () => {
  it('should render paragraph field with default title', () => {
    renderComponent();

    expect(screen.getByTestId('textfield-wrapper-Абзац')).toBeInTheDocument();
  });

  it('should render paragraph field with custom label', () => {
    renderComponent({ label: 'Вступний текст секції' });

    expect(screen.getByTestId('textfield-wrapper-Вступний текст секції')).toBeInTheDocument();
  });

  it('should update localized value on change', () => {
    const { onChange } = renderComponent();

    fireEvent.click(screen.getByTestId('trigger-change-Абзац'));

    expect(onChange).toHaveBeenCalledWith({
      ...baseItem,
      value: {
        ...baseItem.value,
        uk: createDocNode('Updated Абзац')
      }
    });
  });
});
