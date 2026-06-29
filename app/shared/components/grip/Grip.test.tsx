import { render, screen } from '@testing-library/react';
import React from 'react';

import { useSortableItemContext } from '../sortable-item-wrapper/SortableItemWrapper';
import { Grip } from './Grip';
import { styles } from './Grip.styles';

jest.mock('~/public/icons/grip-vertical.svg', () => {
  return function MockGripVertical(props: any) {
    return <svg data-testid="grip-vertical-svg" {...props} />;
  };
});

jest.mock('../sortable-item-wrapper/SortableItemWrapper', () => ({
  useSortableItemContext: jest.fn()
}));

describe('Grip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render vertical grip at center by default', () => {
    (useSortableItemContext as jest.Mock).mockReturnValue({
      attributes: { 'aria-describedby': 'dnd-context' },
      listeners: { onKeyDown: jest.fn() }
    });

    render(<Grip />);

    const svg = screen.getByTestId('grip-vertical-svg');
    expect(svg).toBeInTheDocument();
  });

  it('should support top gripPosition and horizontal orientation', () => {
    (useSortableItemContext as jest.Mock).mockReturnValue({
      attributes: {},
      listeners: {}
    });

    render(<Grip orientation="horizontal" gripPosition="top" />);
    const svg = screen.getByTestId('grip-vertical-svg');
    expect(svg).toBeInTheDocument();
  });

  describe('Grip styles', () => {
    it('should return 90deg rotation for horizontal orientation', () => {
      expect(styles.getGripStyles('horizontal')).toEqual({ rotate: '90deg' });
    });

    it('should return 0deg rotation for vertical orientation', () => {
      expect(styles.getGripStyles('vertical')).toEqual({ rotate: '0deg' });
    });
  });
});
