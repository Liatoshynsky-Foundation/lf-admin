import { Box, Button } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import { Bell, LogOut, User } from 'lucide-react';
import React, { useState } from 'react';

import ActionMenu, { ActionMenuGroups, MenuProps } from './ActionMenu';

const ActionMenuWrapper = (props: MenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <Box sx={{ padding: '100px', display: 'flex', justifyContent: 'center' }}>
      <Button variant="contained" onClick={handleClick}>
        Open Menu
      </Button>
      <ActionMenu {...props} anchorEl={anchorEl} onClose={handleClose} />
    </Box>
  );
};

const meta: Meta<typeof ActionMenu> = {
  title: 'Shared/ActionMenu',
  component: ActionMenu,
  tags: ['autodocs'],
  argTypes: {
    anchorEl: {
      table: {
        disable: true
      }
    },
    onClose: {
      table: {
        disable: true
      }
    },
    menuItems: {
      control: false,
      description: 'Array of menu groups containing menu items. Groups may include an optional title.'
    },
    anchorOrigin: {
      control: false,
      description: 'Defines the attachment point of the menu relative to the anchor element.'
    },
    transformOrigin: {
      control: false,
      description: 'Defines the attachment point on the menu used for positioning.'
    },
    isSelectable: {
      control: 'boolean',
      description: 'Displays a checkmark for the selected menu item.'
    }
  },
  parameters: {
    docs: {
      description: {
        component:
          'Reusable dropdown action menu built on top of the MUI Popover. Supports grouped actions, optional group headers, icons, navigation links, selectable items, and configurable positioning.'
      }
    }
  },
  decorators: [
    (Story) => (
      <Box sx={{ padding: '100px', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </Box>
    )
  ]
} satisfies Meta<typeof ActionMenu>;

export default meta;

type Story = StoryObj<typeof ActionMenu>;

const withIconItems: ActionMenuGroups = [
  {
    items: [
      { id: '1', text: { name: 'Profile', icon: <User size={18} /> } },
      { id: '2', text: { name: 'Notifications', icon: <Bell size={18} /> } }
    ]
  },
  { items: [{ id: '3', text: { name: 'Logout', icon: <LogOut size={18} /> } }] }
];

const withTitleItems: ActionMenuGroups = [
  {
    title: 'User Settings',
    items: [
      { id: '1', text: { name: 'Profile', icon: <User size={18} /> } },
      { id: '2', text: { name: 'Notifications', icon: <Bell size={18} /> } }
    ]
  },
  { items: [{ id: '3', text: { name: 'Logout', icon: <LogOut size={18} /> } }] }
];

const noIconItems: ActionMenuGroups = [
  {
    items: [
      { id: 'a', text: { name: 'Option A' } },
      { id: 'b', text: { name: 'Option B' } }
    ]
  }
];

const selectableItems: ActionMenuGroups = [
  {
    items: [
      { id: 's1', text: { name: 'Dark Mode' }, selected: true },
      { id: 's2', text: { name: 'Light Mode' }, selected: false }
    ]
  }
];

const MixItems: ActionMenuGroups = [
  {
    items: [
      {
        id: 'a',
        text: {
          name: 'Option A',
          icon: <User size={18} />
        },
        selected: true
      },
      {
        id: 'b',
        text: {
          name: 'Option B',
          icon: <User size={18} />
        }
      }
    ]
  },

  {
    title: 'Settings',
    items: [
      {
        id: 'c',
        text: {
          name: 'Option C'
        }
      }
    ]
  }
];

export const StandardWithIcons: Story = {
  render: (args) => <ActionMenuWrapper {...args} />,
  args: { menuItems: noIconItems }
};

export const WithIcons: Story = {
  render: (args) => <ActionMenuWrapper {...args} />,
  args: { menuItems: withIconItems }
};

export const SelectableMenu: Story = {
  render: (args) => <ActionMenuWrapper {...args} />,
  args: {
    isSelectable: true,
    menuItems: selectableItems
  }
};

export const withTitleMenu: Story = {
  render: (args) => <ActionMenuWrapper {...args} />,
  args: {
    menuItems: withTitleItems
  }
};

export const Mixed: Story = {
  render: (args) => <ActionMenuWrapper {...args} />,
  args: {
    isSelectable: true,
    menuItems: MixItems,
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    transformOrigin: { vertical: 'top', horizontal: 'center' }
  }
};

export const severalGroupsMenu: Story = {
  render: (args) => <ActionMenuWrapper {...args} />,
  args: {
    menuItems: [...noIconItems, ...withIconItems]
  }
};

export const TopLeftAnchor: Story = {
  render: (args) => <ActionMenuWrapper {...args} />,
  args: {
    menuItems: noIconItems,
    anchorOrigin: { vertical: 'top', horizontal: 'left' },
    transformOrigin: { vertical: 'bottom', horizontal: 'right' }
  }
};

export const BottomCenterAnchor: Story = {
  render: (args) => <ActionMenuWrapper {...args} />,
  args: {
    menuItems: noIconItems,
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    transformOrigin: { vertical: 'top', horizontal: 'center' }
  }
};
