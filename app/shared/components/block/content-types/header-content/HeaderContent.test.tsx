import { fireEvent, render, screen } from '@testing-library/react';

import { HeaderContent } from './HeaderContent';
import { createDocNode } from '~/__mocks__/utils';
import { useTitleValidation } from '~/shared/hooks/use-title-validation/useTitleValidation';
import type { HeaderContentItem } from '~/types/blocks/contentTypes';

jest.mock('~/shared/components/design-system/text-field/TextField');
jest.mock('~/shared/hooks/use-title-validation/useTitleValidation');

const mockUseTitleValidation = useTitleValidation as jest.Mock;
const mockOnBlur = jest.fn();

const baseItem: HeaderContentItem = {
  id: 'header-1',
  type: 'header',
  title: { uk: createDocNode('Заголовок UK'), en: createDocNode('Title EN') }
};

describe('HeaderContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTitleValidation.mockReturnValue({
      onBlur: mockOnBlur,
      error: false,
      helperText: undefined
    });
  });

  it('should render title field and wire validation', () => {
    const onChange = jest.fn();

    render(<HeaderContent item={baseItem} locale="uk" onChange={onChange} pageId="about-us" blockId="mission" />);

    expect(mockUseTitleValidation).toHaveBeenCalledWith('about-us:mission:title', baseItem.title.uk);
    expect(screen.getByTestId('textfield-wrapper-Заголовок секції')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('trigger-change-Заголовок секції'));
    expect(onChange).toHaveBeenCalledWith({
      ...baseItem,
      title: {
        ...baseItem.title,
        uk: createDocNode('Updated Заголовок секції')
      }
    });

    fireEvent.click(screen.getByTestId('trigger-blur-Заголовок секції'));
    expect(mockOnBlur).toHaveBeenCalled();
  });

  it('should render helper field when helper text is provided', () => {
    const onChange = jest.fn();
    const item: HeaderContentItem = {
      ...baseItem,
      helper: { uk: createDocNode('Helper UK'), en: createDocNode('Helper EN') }
    };

    render(<HeaderContent item={item} locale="uk" onChange={onChange} pageId="about-us" blockId="mission" />);

    expect(screen.getByTestId('textfield-wrapper-Допоміжний текст')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('trigger-change-Допоміжний текст'));

    expect(onChange).toHaveBeenCalledWith({
      ...item,
      helper: {
        ...item.helper!,
        uk: createDocNode('Updated Допоміжний текст')
      }
    });
  });

  it('should not render helper field when helper is missing', () => {
    render(<HeaderContent item={baseItem} locale="uk" onChange={jest.fn()} pageId="about-us" blockId="mission" />);

    expect(screen.queryByTestId('textfield-wrapper-Допоміжний текст')).not.toBeInTheDocument();
  });
});
