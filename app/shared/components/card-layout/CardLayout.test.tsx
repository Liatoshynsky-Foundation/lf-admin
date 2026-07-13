import { Box, Button } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import CardLayout from './CardLayout';
import styles from './CardLayout.styles';

interface ActionMenuMockProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  menuItems: unknown;
  anchorOrigin?: { vertical: string; horizontal: string };
  transformOrigin?: { vertical: string; horizontal: string };
}

jest.mock('../dropdown-menu/ActionMenu', () => {
  return jest.fn().mockImplementation(({ anchorEl, onClose, anchorOrigin }: ActionMenuMockProps) =>
    anchorEl ? (
      <Box data-testid="action-menu" data-anchor-horizontal={anchorOrigin?.horizontal}>
        <Button data-testid="menu-close-trigger" onClick={onClose}>
          Close
        </Button>
      </Box>
    ) : null
  );
});

const cardStyleSpy = jest.spyOn(styles, 'card');
jest.mock('lucide-react', () => ({
  EllipsisVertical: () => <svg data-testid="ellipsis-icon" />
}));

const defaultItems = [{ title: 'Group 1', items: [{ id: 'edit', text: { name: 'Edit' } }] }];

const renderCardLayout = (overrides: Partial<React.ComponentProps<typeof CardLayout>> = {}) =>
  render(
    <CardLayout
      coverImage={<div data-testid="cover" />}
      title={<span>Card Title</span>}
      info={<span>Card Info</span>}
      items={defaultItems}
      {...overrides}
    />
  );

describe('CardLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(globalThis, 'innerWidth', { writable: true, configurable: true, value: 1200 });
  });

  describe('Rendering', () => {
    it('renders cover image', () => {
      renderCardLayout();
      expect(screen.getByTestId('cover')).toBeInTheDocument();
    });

    it('renders title', () => {
      renderCardLayout();
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('renders info', () => {
      renderCardLayout();
      expect(screen.getByText('Card Info')).toBeInTheDocument();
    });

    it('renders menu button with icon', () => {
      renderCardLayout();
      expect(screen.getByTestId('menu-button')).toBeInTheDocument();
      expect(screen.getByTestId('ellipsis-icon')).toBeInTheDocument();
    });

    it('renders optional contentUpper when provided', () => {
      renderCardLayout({ contentUpper: <div>Upper Content</div> });
      expect(screen.getByText('Upper Content')).toBeInTheDocument();
    });

    it('renders optional contentBottom when provided', () => {
      renderCardLayout({ contentBottom: <div>Bottom Content</div> });
      expect(screen.getByText('Bottom Content')).toBeInTheDocument();
    });

    it('does not render ActionMenu initially', () => {
      renderCardLayout();
      expect(screen.queryByTestId('action-menu')).not.toBeInTheDocument();
    });
  });

  describe('Menu open/close flow', () => {
    it('opens menu on menu button click', async () => {
      renderCardLayout();
      await userEvent.click(screen.getByTestId('menu-button'));
      expect(screen.getByTestId('action-menu')).toBeInTheDocument();
    });

    it('closes menu when onClose is called from within ActionMenu', async () => {
      renderCardLayout();
      await userEvent.click(screen.getByTestId('menu-button'));
      expect(screen.getByTestId('action-menu')).toBeInTheDocument();

      await userEvent.click(screen.getByTestId('menu-close-trigger'));
      expect(screen.queryByTestId('action-menu')).not.toBeInTheDocument();
    });

    it('toggles menu closed on second button click', async () => {
      renderCardLayout();
      const menuBtn = screen.getByTestId('menu-button');

      await userEvent.click(menuBtn);
      expect(screen.getByTestId('action-menu')).toBeInTheDocument();

      await userEvent.click(menuBtn);
      expect(screen.queryByTestId('action-menu')).not.toBeInTheDocument();
    });

    it('stops event propagation on menu button click', async () => {
      const parentHandler = jest.fn();
      render(
        <Box onClick={parentHandler}>
          <CardLayout
            coverImage={<div data-testid="cover" />}
            title={<span>T</span>}
            info={<span>I</span>}
            items={defaultItems}
          />
        </Box>
      );
      await userEvent.click(screen.getByTestId('menu-button'));
      expect(parentHandler).not.toHaveBeenCalled();
    });
  });

  describe('Menu positioning and direction logic', () => {
    const getButtonRect = (right: number) =>
      ({
        right,
        left: right - 40,
        top: 0,
        bottom: 40,
        width: 40,
        height: 40,
        x: right - 40,
        y: 0,
        toJSON: () => ({})
      }) as DOMRect;

    it('sets horizontal positioning to "right" (menuDirection left) when space on the right is sufficient', async () => {
      const menuBtn = renderCardLayout({ spaceBetweenContent: 200 }).getByTestId('menu-button');

      jest.spyOn(menuBtn, 'getBoundingClientRect').mockReturnValue(getButtonRect(900));

      await userEvent.click(menuBtn);
      expect(screen.getByTestId('action-menu')).toHaveAttribute('data-anchor-horizontal', 'right');
    });

    it('sets horizontal positioning to "left" (menuDirection right) when space on the right is insufficient', async () => {
      const menuBtn = renderCardLayout({ spaceBetweenContent: 200 }).getByTestId('menu-button');

      jest.spyOn(menuBtn, 'getBoundingClientRect').mockReturnValue(getButtonRect(1100));

      await userEvent.click(menuBtn);
      expect(screen.getByTestId('action-menu')).toHaveAttribute('data-anchor-horizontal', 'left');
    });
  });

  describe('Interactive states styling', () => {
    it('executes real styles logic and passes flags correctly', () => {
      const { rerender } = render(
        <CardLayout
          coverImage={<div />}
          title={<span />}
          info={<span />}
          items={defaultItems}
          interactive={true}
          isSelected={true}
        />
      );
      expect(cardStyleSpy).toHaveBeenLastCalledWith(true, true);

      rerender(
        <CardLayout
          coverImage={<div />}
          title={<span />}
          info={<span />}
          items={defaultItems}
          interactive={false}
          isSelected={false}
        />
      );
      expect(cardStyleSpy).toHaveBeenLastCalledWith(false, false);
    });
  });
});
