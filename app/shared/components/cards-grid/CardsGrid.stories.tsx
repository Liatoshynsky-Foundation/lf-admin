import { Card, CardContent, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

import CardsGrid from './CardsGrid';

interface MockItem {
  id: string;
  title: string;
  description: string;
}

const mockItems: MockItem[] = Array.from({ length: 6 }, (_, index) => ({
  id: `card-${index + 1}`,
  title: `Card ${index + 1}`,
  description: `Description for card ${index + 1}`
}));

const renderMockChildren = () =>
  mockItems.map((item) => (
    <Card key={item.id}>
      <CardContent>
        <Typography variant="h6">{item.title}</Typography>
        <Typography variant="body2">{item.description}</Typography>
      </CardContent>
    </Card>
  ));

const meta: Meta<typeof CardsGrid> = {
  title: 'Shared/CardsGrid',
  component: CardsGrid,
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: false,
      description: 'The content inside the grid (usually a list of cards)'
    },
    dataTestId: {
      control: 'text',
      description: 'Test id for grid container'
    },
    columns: {
      control: 'object',
      description:
        'Responsive columns configuration. Supports: { xsCols?: number, smCols?: number, mdCols?: number, xlCols?: number }'
    },
    gap: {
      control: 'text',
      description: 'Gap between grid items'
    }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <CardsGrid {...args}>{renderMockChildren()}</CardsGrid>
};

export const CustomColumns: Story = {
  render: (args) => (
    <CardsGrid
      {...args}
      columns={{
        xsCols: 3,
        smCols: 4,
        mdCols: 5,
        xlCols: 6
      }}
    >
      {renderMockChildren()}
    </CardsGrid>
  )
};

export const LargeGap: Story = {
  render: (args) => (
    <CardsGrid {...args} gap="32px">
      {renderMockChildren()}
    </CardsGrid>
  )
};

export const WithDataTestId: Story = {
  render: (args) => (
    <CardsGrid {...args} dataTestId="cards-grid">
      {renderMockChildren()}
    </CardsGrid>
  )
};
