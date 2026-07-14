import { useArgs } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';
import { ChangeEvent } from 'react';

import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Shared/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: 'number'
    },
    totalPages: {
      control: 'number'
    },
    hideNextButton: {
      control: 'boolean'
    },
    hidePrevButton: {
      control: 'boolean'
    },
    siblingCount: {
      control: 'number'
    }
  },
  args: {
    totalPages: 7,
    currentPage: 4,
  },

  parameters: {
    docs: {
      description: {
        component: 'Reusable pagination component.'
      }
    }
  },

  render: function Render(args) {
    const [{ currentPage }, updateArgs] = useArgs();

    const handlePageChange = (_: ChangeEvent<unknown>, newPage: number) => {
      updateArgs({ currentPage: newPage });
    };

    return (
      <Pagination
        {...args}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    );
  }
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 7,
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 7,
    totalPages: 7,
  },
};

export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
  },
};

export const ManyPages: Story = {
  args: {
    currentPage: 12,
    totalPages: 30,
  },
};

export const HiddenNextButton: Story = {
  args: {
    hideNextButton: true,
  },
};

export const HiddenPrevButton: Story = {
  args: {
    hidePrevButton: true,
  },
};

export const CustomSiblingCount: Story = {
  args: {
    currentPage: 10,
    totalPages: 20,
    siblingCount: 2,
  },
};

export const TwoPages: Story = {
  args: {
    currentPage: 1,
    totalPages: 2,
  },
};