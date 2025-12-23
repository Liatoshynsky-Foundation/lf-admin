import { fireEvent, render, screen } from '@testing-library/react';

import { CustomTabs } from './Tabs';

describe('CustomTabs', () => {
  const tabs = [
    { id: 'all', label: 'Всі' },
    { id: 'image', label: 'Зображення' },
    { id: 'pdf', label: 'PDF' },
    { id: 'audio', label: 'Аудіо' },
    { id: 'favorite', label: 'Обрані' }
  ];

  const defaultProps = {
    tabs,
    activeTab: 'all',
    onTabChange: jest.fn(),
    dataTestId: 'TestTabs'
  };

  it('should render root container with correct data-testid', () => {
    render(<CustomTabs {...defaultProps} />);
    expect(screen.getByTestId('TestTabs')).toBeInTheDocument();
  });

  it('should render tabs wrapper with correct data-testid', () => {
    render(<CustomTabs {...defaultProps} />);
    expect(screen.getByTestId('TestTabs-tabs')).toBeInTheDocument();
  });

  it('should render all tabs with correct test ids', () => {
    render(<CustomTabs {...defaultProps} />);

    tabs.forEach((tab) => {
      const element = screen.getByTestId(`TestTabs-tab-${tab.id}`);
      expect(element).toBeInTheDocument();
      expect(element).toHaveTextContent(String(tab.label));
    });
  });

  it('should call onTabChange when clicking on a tab', () => {
    render(<CustomTabs {...defaultProps} />);

    const targetTab = screen.getByTestId('TestTabs-tab-image');
    fireEvent.click(targetTab);

    expect(defaultProps.onTabChange).toHaveBeenCalledTimes(1);
    expect(defaultProps.onTabChange).toHaveBeenCalledWith('image');
  });

  it('should visually select the active tab', () => {
    render(<CustomTabs {...defaultProps} />);

    const activeTab = screen.getByTestId('TestTabs-tab-all');
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should update selected tab when activeTab prop changes', () => {
    const { rerender } = render(<CustomTabs {...defaultProps} />);

    rerender(<CustomTabs {...defaultProps} activeTab="audio" />);

    const newlyActive = screen.getByTestId('TestTabs-tab-audio');
    expect(newlyActive).toHaveAttribute('aria-selected', 'true');
  });
});
