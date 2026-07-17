import { Box, Button } from '@mui/material';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import toast from 'react-hot-toast';

import FileCardMenuItems from '../file-card/FileCardMenuItems';
import MinimizedFileCard from './MinimizedFileCard';
import { styles } from '~/shared/components/minimized-file-card/MinimizedFileCard.styles';

type FileCardMenuItemsProps = Parameters<typeof FileCardMenuItems>[0];

let capturedMenuItemsProps: FileCardMenuItemsProps | null = null;
const mockUpdateAsset = jest.fn();

const containerStyleSpy = jest.spyOn(styles, 'container');
let mockIsUpdatingStar = false;

jest.mock('~/public/icons/link.svg', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'svg'>) => <svg data-testid="link-icon" {...props} />
}));

jest.mock('lucide-react', () => ({
  EllipsisVertical: (props: React.ComponentProps<'svg'>) => <svg data-testid="menu-icon" {...props} />
}));

jest.mock('~/public/icons/star-1.svg', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'svg'>) => <svg data-testid="star-icon" {...props} />
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  ...jest.requireActual('~/types/graphql/generated/graphql'),
  useUpdateAssetMutation: () => [mockUpdateAsset, { loading: mockIsUpdatingStar }]
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn()
  }
}));

jest.mock('../file-card/FileCardMenuItems', () => {
  return jest.fn((props: FileCardMenuItemsProps) => {
    capturedMenuItemsProps = props;
    return [
      { text: 'Відкрити деталі', onClick: props.onOpenDetails },
      { text: 'Перейменувати', onClick: props.onRename },
      {
        text: props.isStarred ? 'Прибрати з обраних' : 'Додати в обрані',
        onClick: props.onToggleStar
      },
      { text: 'Завантажити', onClick: props.onDownload },
      { text: 'Видалити', onClick: props.onDelete }
    ];
  });
});

interface MockActionMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  menuItems: Array<{ text: string; onClick: () => void }>;
}

jest.mock('../dropdown-menu/ActionMenu', () => {
  const MockActionMenu = ({ anchorEl, onClose, menuItems }: MockActionMenuProps) => {
    if (!anchorEl) return null;
    return (
      <Box data-testid="action-menu" data-open="true">
        <Button data-testid="close-menu-btn" onClick={onClose}>
          Close
        </Button>
        {menuItems.map((item, index) => (
          <Button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              item.onClick();
            }}
          >
            {item.text}
          </Button>
        ))}
      </Box>
    );
  };
  MockActionMenu.displayName = 'MockActionMenu';
  return MockActionMenu;
});

describe('MinimizedFileCard', () => {
  const defaultProps = {
    id: 'test-id-123',
    name: 'Test File',
    date: '10.10.2025'
  };

  afterEach(() => {
    mockIsUpdatingStar = false;
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    capturedMenuItemsProps = null;
    mockUpdateAsset.mockReset().mockResolvedValue({});
  });

  it('should execute real container styles logic with true and false states', () => {
    const { rerender } = render(<MinimizedFileCard {...defaultProps} isSelected={true} />);
    expect(containerStyleSpy).toHaveBeenLastCalledWith(true);

    rerender(<MinimizedFileCard {...defaultProps} isSelected={false} />);
    expect(containerStyleSpy).toHaveBeenLastCalledWith(false);
  });

  it('should render component with required props and default file type', () => {
    render(<MinimizedFileCard {...defaultProps} />);

    expect(screen.getByText('Test File')).toBeInTheDocument();
    expect(screen.getByText('10.10.2025')).toBeInTheDocument();
    expect(screen.getByAltText('img file icon')).toBeInTheDocument();
  });

  it('should render audio icon when fileType is audio', () => {
    render(<MinimizedFileCard {...defaultProps} fileType="audio" />);
    expect(screen.getByAltText('audio file icon')).toBeInTheDocument();
  });

  it('should render pdf icon when fileType is pdf', () => {
    render(<MinimizedFileCard {...defaultProps} fileType="pdf" />);
    expect(screen.getByAltText('pdf file icon')).toBeInTheDocument();
  });

  it('should render document icon when fileType is doc', () => {
    render(<MinimizedFileCard {...defaultProps} fileType="doc" />);
    expect(screen.getByAltText('doc file icon')).toBeInTheDocument();
  });

  it('should render spreadsheet icon when fileType is xls', () => {
    render(<MinimizedFileCard {...defaultProps} fileType="xls" />);
    expect(screen.getByAltText('xls file icon')).toBeInTheDocument();
  });

  it('should render video icon when fileType is video-file', () => {
    render(<MinimizedFileCard {...defaultProps} fileType="video-file" />);
    expect(screen.getByAltText('video-file file icon')).toBeInTheDocument();
  });

  it('should render archive icon when fileType is archive', () => {
    render(<MinimizedFileCard {...defaultProps} fileType="archive" />);
    expect(screen.getByAltText('archive file icon')).toBeInTheDocument();
  });

  it('should render star icon when starred prop is true', () => {
    render(<MinimizedFileCard {...defaultProps} starred={true} />);
    expect(screen.getByLabelText('Starred file')).toBeInTheDocument();
  });

  it('should not render star icon when starred prop is false', () => {
    render(<MinimizedFileCard {...defaultProps} starred={false} />);
    expect(screen.queryByLabelText('Starred file')).not.toBeInTheDocument();
  });

  it('should render link icon when linked prop is true', () => {
    render(<MinimizedFileCard {...defaultProps} linked={true} />);
    expect(screen.getByLabelText('File is linked to other pages')).toBeInTheDocument();
  });

  it('should not render link icon when linked prop is false', () => {
    render(<MinimizedFileCard {...defaultProps} linked={false} />);
    expect(screen.queryByLabelText('File is linked to other pages')).not.toBeInTheDocument();
  });

  it('should call onClick handler when the card is clicked', async () => {
    const handleClick = jest.fn();
    render(<MinimizedFileCard {...defaultProps} onClick={handleClick} />);

    await userEvent.click(screen.getByText('Test File'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should call onMenuClick handler when the menu button is clicked', async () => {
    const handleMenuClick = jest.fn();
    render(<MinimizedFileCard {...defaultProps} onMenuClick={handleMenuClick} />);

    const menuButton = screen.getByLabelText('Open file menu');
    await userEvent.click(menuButton);

    expect(handleMenuClick).toHaveBeenCalledTimes(1);
  });

  it('should stop propagation and not call onClick when menu button is clicked', async () => {
    const handleClick = jest.fn();
    const handleMenuClick = jest.fn();

    render(<MinimizedFileCard {...defaultProps} onClick={handleClick} onMenuClick={handleMenuClick} />);

    const menuButton = screen.getByLabelText('Open file menu');
    await userEvent.click(menuButton);

    expect(handleMenuClick).toHaveBeenCalledTimes(1);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should call menu actions with file id', async () => {
    const handleClick = jest.fn();
    const handleAction = jest.fn();
    const user = userEvent.setup();

    render(<MinimizedFileCard {...defaultProps} onClick={handleClick} onAction={handleAction} />);

    await user.click(screen.getByLabelText('Open file menu'));
    await user.click(screen.getByText('Відкрити деталі'));
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.click(screen.getByLabelText('Open file menu'));
    await user.click(screen.getByText('Перейменувати'));
    expect(handleAction).toHaveBeenCalledWith('rename', 'test-id-123');

    await user.click(screen.getByLabelText('Open file menu'));
    await user.click(screen.getByText('Завантажити'));
    expect(handleAction).toHaveBeenCalledWith('download', 'test-id-123');

    await user.click(screen.getByLabelText('Open file menu'));
    await user.click(screen.getByText('Видалити'));
    expect(handleAction).toHaveBeenCalledWith('delete', 'test-id-123');
  });

  it('should call onToggleStar from menu', async () => {
    const handleToggleStar = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<MinimizedFileCard {...defaultProps} onToggleStar={handleToggleStar} />);

    await user.click(screen.getByLabelText('Open file menu'));
    await user.click(screen.getByText('Додати в обрані'));

    expect(handleToggleStar).toHaveBeenCalledWith('test-id-123', true);
  });

  it('should update asset favorite state when onToggleStar is not provided', async () => {
    const user = userEvent.setup();

    render(<MinimizedFileCard {...defaultProps} />);

    await user.click(screen.getByLabelText('Open file menu'));
    await user.click(screen.getByText('Додати в обрані'));

    expect(mockUpdateAsset).toHaveBeenCalledWith({
      variables: {
        id: 'test-id-123',
        input: { isStarred: true }
      }
    });
  });

  it('should show error toast when favorite update fails', async () => {
    const user = userEvent.setup();
    mockUpdateAsset.mockRejectedValueOnce(new Error('Favorite failed'));

    render(<MinimizedFileCard {...defaultProps} />);

    await user.click(screen.getByLabelText('Open file menu'));
    await user.click(screen.getByText('Додати в обрані'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Favorite failed');
    });
  });

  it('should show fallback error toast when favorite update fails without Error instance', async () => {
    const user = userEvent.setup();
    mockUpdateAsset.mockRejectedValueOnce('Favorite failed');

    render(<MinimizedFileCard {...defaultProps} />);

    await user.click(screen.getByLabelText('Open file menu'));
    await user.click(screen.getByText('Додати в обрані'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Не вдалося оновити статус обраного файлу. Спробуйте пізніше.');
    });
  });

  it('should toggle starred file from visible star icon without opening card', async () => {
    const handleClick = jest.fn();
    const handleToggleStar = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<MinimizedFileCard {...defaultProps} starred onClick={handleClick} onToggleStar={handleToggleStar} />);

    await user.click(screen.getByLabelText('Starred file'));

    expect(handleToggleStar).toHaveBeenCalledWith('test-id-123', false);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render waiting cursor while favorite state is updating', () => {
    mockIsUpdatingStar = true;

    render(<MinimizedFileCard {...defaultProps} starred />);

    expect(screen.getByLabelText('Starred file')).toHaveStyle({ cursor: 'wait' });
  });

  it('should correctly map and call actions inside FileCardMenuItems props object', async () => {
    const handleClick = jest.fn();
    const handleAction = jest.fn();

    render(<MinimizedFileCard {...defaultProps} starred={true} onClick={handleClick} onAction={handleAction} />);

    expect(capturedMenuItemsProps).not.toBeNull();
    if (!capturedMenuItemsProps) return;

    capturedMenuItemsProps.onOpenDetails();
    expect(handleClick).toHaveBeenCalledTimes(1);

    capturedMenuItemsProps.onRename();
    expect(handleAction).toHaveBeenCalledWith('rename', 'test-id-123');

    capturedMenuItemsProps.onDownload();
    expect(handleAction).toHaveBeenCalledWith('download', 'test-id-123');

    capturedMenuItemsProps.onDelete();
    expect(handleAction).toHaveBeenCalledWith('delete', 'test-id-123');

    capturedMenuItemsProps.onToggleStar();
    expect(mockUpdateAsset).toHaveBeenCalledWith({
      variables: {
        id: 'test-id-123',
        input: { isStarred: false }
      }
    });
  });

  it('should have pointer cursor when star is not updating', () => {
    render(<MinimizedFileCard {...defaultProps} starred={true} />);

    const starWrapper = screen.getByLabelText('Starred file');
    expect(starWrapper).toHaveStyle('cursor: pointer');
  });

  it('should have wait cursor when star is updating (loading is true)', () => {
    mockIsUpdatingStar = true;
    render(<MinimizedFileCard {...defaultProps} starred={true} />);
    const starWrapper = screen.getByLabelText('Starred file');
    expect(starWrapper).toHaveStyle('cursor: wait');
  });
});
