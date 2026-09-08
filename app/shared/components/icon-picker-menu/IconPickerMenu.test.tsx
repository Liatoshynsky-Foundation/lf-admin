import { fireEvent, render, screen } from '@testing-library/react';

import { IconPickerMenu } from './IconPickerMenu';
import { useMenuScrollClose } from '~/shared/hooks/use-menu-scroll-close/useMenuScrollClose';

type Option = { key: string; label: string };

const options: readonly Option[] = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' }
];

const handleClose = jest.fn();
const handleSelect = jest.fn();

jest.mock('~/shared/hooks/use-menu-scroll-close/useMenuScrollClose', () => ({
  useMenuScrollClose: jest.fn()
}));

describe('IconPickerMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useMenuScrollClose).mockImplementation(({ onClose }: { onClose: () => void }) => ({
      disableTransition: false,
      handleClose: onClose
    }));
  });

  it('does not render when closed', () => {
    render(
      <IconPickerMenu
        anchorEl={null}
        options={options}
        getOptionKey={(option) => option.key}
        getOptionIcon={(option) => option.label}
        onClose={handleClose}
        onSelect={handleSelect}
      />
    );

    expect(screen.queryByText('Facebook')).not.toBeInTheDocument();
  });

  it('renders options, selects an option, and closes', () => {
    render(
      <IconPickerMenu
        anchorEl={document.body}
        options={options}
        getOptionKey={(option) => option.key}
        getOptionIcon={(option) => option.label}
        onClose={handleClose}
        onSelect={handleSelect}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Facebook' }));
    expect(handleSelect).toHaveBeenCalledWith(options[0]);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('disables the menu transition when requested by the scroll hook', () => {
    jest.mocked(useMenuScrollClose).mockReturnValue({ disableTransition: true, handleClose });

    render(
      <IconPickerMenu
        anchorEl={document.body}
        options={options}
        getOptionKey={(option) => option.key}
        getOptionIcon={(option) => option.label}
        onClose={handleClose}
        onSelect={handleSelect}
      />
    );

    expect(screen.getByText(options[0].label)).toBeInTheDocument();
  });
});
