import { render, screen, within } from '@testing-library/react';

import { SearchStatusToolbar } from './SearchStatusToolbar';

jest.mock('../control-panel', () => ({
  ControlPanel: ({ dataTestId }: any) => (
    <div data-testid={dataTestId || 'control-panel'}>
      <div data-testid="search" />
      <div data-testid="status-dropdown" />
    </div>
  )
}));

const mockProps = {
  dataTestId: 'control-panel',
  searchProps: {
    search: '',
    setSearch: jest.fn(),
    options: []
  },
  statusFilterProps: {
    label: 'Status',
    options: [],
    onChange: jest.fn()
  }
};

const renderComponent = (props = mockProps) => {
  render(<SearchStatusToolbar {...props} />);
};

describe('SearchStatusToolbar', () => {
  it('should render the component with the search & the status filter dropdown', ()=>{
    renderComponent();
    const controlPanel = screen.getByTestId('control-panel');

    expect(within(controlPanel).getByTestId('search')).toBeInTheDocument();
    expect(within(controlPanel).getByTestId('status-dropdown')).toBeInTheDocument();
  });
});
