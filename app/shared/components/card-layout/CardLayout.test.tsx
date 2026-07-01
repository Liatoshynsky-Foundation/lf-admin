import { Box } from '@mui/material';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import CardLayout from './CardLayout';

jest.mock('./CardMenu', () => {
  const MockCardMenu = ({
    anchorEl,
    onClose,
    menuItems,
    menuDirection
  }: {
    anchorEl: HTMLElement | null;
    onClose: () => void;
    menuItems: { text: { name: string } }[];
    menuDirection: string;
  }) =>
    anchorEl ? (
      <div data-testid="card-menu" data-direction={menuDirection}>
        {menuItems.map((item) => (
          <button key={item.text.name} onClick={onClose}>
            {item.text.name}
          </button>
        ))}
      </div>
    ) : null;
  MockCardMenu.displayName = 'MockCardMenu';
  return MockCardMenu;
});

jest.mock('./CardLayout.styles', () => ({
  __esModule: true,
  default: {
    card: jest.fn(() => ({})),
    imageContainer: {},
    cardContent: {},
    fullInfo: {},
    mainInfo: {},
    titleContainer: {}
  }
}));

jest.mock('lucide-react', () => ({
  EllipsisVertical: () => <svg data-testid="ellipsis-icon" />
}));

const defaultItems = [
  { text: { name: 'Edit' }, onClick: jest.fn() },
  { text: { name: 'Delete' }, href: '/delete' }
];

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

    it('does not render contentUpper when omitted', () => {
      renderCardLayout();
      expect(screen.queryByText('Upper Content')).not.toBeInTheDocument();
    });

    it('does not render contentBottom when omitted', () => {
      renderCardLayout();
      expect(screen.queryByText('Bottom Content')).not.toBeInTheDocument();
    });

    it('does not render CardMenu initially', () => {
      renderCardLayout();
      expect(screen.queryByTestId('card-menu')).not.toBeInTheDocument();
    });
  });

  describe('Menu open/close', () => {
    it('opens menu on menu button click', async () => {
      renderCardLayout();
      await userEvent.click(screen.getByTestId('menu-button'));
      expect(screen.getByTestId('card-menu')).toBeInTheDocument();
    });

    it('renders all menu items when menu is open', async () => {
      renderCardLayout();
      await userEvent.click(screen.getByTestId('menu-button'));
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('closes menu when a menu item is clicked (onClose callback)', async () => {
      renderCardLayout();
      await userEvent.click(screen.getByTestId('menu-button'));
      await userEvent.click(screen.getByText('Edit'));
      expect(screen.queryByTestId('card-menu')).not.toBeInTheDocument();
    });

    it('toggles menu closed on second button click', async () => {
      renderCardLayout();
      const menuBtn = screen.getByTestId('menu-button');
      await userEvent.click(menuBtn);
      expect(screen.getByTestId('card-menu')).toBeInTheDocument();
      await userEvent.click(menuBtn);
      expect(screen.queryByTestId('card-menu')).not.toBeInTheDocument();
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

  describe('Menu direction', () => {
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

    it('sets menuDirection to "left" when there is enough space on the right', async () => {
      const menuBtn = renderCardLayout().getByTestId('menu-button');
      jest.spyOn(menuBtn, 'getBoundingClientRect').mockReturnValue(getButtonRect(100));
      await userEvent.click(menuBtn);
      expect(screen.getByTestId('card-menu')).toHaveAttribute('data-direction', 'left');
    });

    it('sets menuDirection to "right" when space on the right is insufficient', async () => {
      const menuBtn = renderCardLayout().getByTestId('menu-button');
      jest.spyOn(menuBtn, 'getBoundingClientRect').mockReturnValue(getButtonRect(1100));
      await userEvent.click(menuBtn);
      expect(screen.getByTestId('card-menu')).toHaveAttribute('data-direction', 'right');
    });

    it('respects custom spaceBetweenContent prop', async () => {
      const { getByTestId } = renderCardLayout({ spaceBetweenContent: 300 });
      const menuBtn = getByTestId('menu-button');
      jest.spyOn(menuBtn, 'getBoundingClientRect').mockReturnValue(getButtonRect(950));
      await userEvent.click(menuBtn);
      expect(getByTestId('card-menu')).toHaveAttribute('data-direction', 'right');
    });
  });

  describe('Scroll behaviour', () => {
    it('closes menu on window scroll when menu is open', async () => {
      renderCardLayout();
      await userEvent.click(screen.getByTestId('menu-button'));
      expect(screen.getByTestId('card-menu')).toBeInTheDocument();

      fireEvent.scroll(document);

      await waitFor(() => {
        expect(screen.queryByTestId('card-menu')).not.toBeInTheDocument();
      });
    });

    it('does not attach scroll listener when menu is closed', () => {
      const addEventSpy = jest.spyOn(globalThis, 'addEventListener');
      renderCardLayout();
      const scrollCalls = addEventSpy.mock.calls.filter(([event]) => event === 'scroll');
      expect(scrollCalls).toHaveLength(0);
    });

    it('removes scroll listener after menu closes', async () => {
      const removeEventSpy = jest.spyOn(globalThis, 'removeEventListener');
      renderCardLayout();
      await userEvent.click(screen.getByTestId('menu-button'));
      await userEvent.click(screen.getByTestId('menu-button'));
      const scrollRemovals = removeEventSpy.mock.calls.filter(([event]) => event === 'scroll');
      expect(scrollRemovals.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('interactive prop', () => {
    it('passes interactive=true to styles.card', async () => {
      const styles = (await import('./CardLayout.styles')).default;
      renderCardLayout({ interactive: true });
      expect(styles.card).toHaveBeenCalledWith(true, false);
    });

    it('passes interactive=false (default) to styles.card', async () => {
      const styles = (await import('./CardLayout.styles')).default;
      renderCardLayout();
      expect(styles.card).toHaveBeenCalledWith(false, false);
    });

    it('passes isSelected=true to styles.card', async () => {
      const styles = (await import('./CardLayout.styles')).default;
      renderCardLayout({ isSelected: true });
      expect(styles.card).toHaveBeenCalledWith(false, true);
    });
  });
});
