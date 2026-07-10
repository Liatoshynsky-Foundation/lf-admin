import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Pagination, PaginationProps } from './Pagination';
jest.mock('@mui/material', () => ({
  __esModule: true,
  Pagination: (props: any) => (<div data-testid="mock-pagination">
    {
      !props.hidePrevButton && (
        <button data-testid='interactive-prev-page-btn' onClick={(e) => props.onChange(e, props.page - 1)} />
      )
    }
    <span data-testid="current-page">{props.page}</span>
    <span data-testid="total-pages">{props.count}</span>

    {props.renderItem({ type: 'next' })}
    {props.renderItem({ type: 'previous' })}
    {
      !props.hideNextButton && (
        <button
          data-testid="interactive-next-page-btn"
          onClick={(e) => props.onChange(e, props.page + 1)}
        >
                    Next
        </button>
      )
    }

  </div>),
  PaginationItem: (props: any) => <div data-testid={`item-slot-${props.type}`}>
    {props.slots?.next && <span data-testid="custom-next-icon" />}
    {props.slots?.previous && <span data-testid="custom-previous-icon" />}
  </div>,
}));
jest.mock('~/public/icons/chevronLeft.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="chevron-left-icon" />
}));

jest.mock('~/public/icons/chevronRight.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="chevron-right-icon" />
}));

const mockOnPageChange = jest.fn();

const defaultProps: PaginationProps = {
  totalPages: 10,
  currentPage: 1,
  onPageChange: mockOnPageChange
};

const renderComponent = (props: PaginationProps = {}) => {
  return render(<Pagination {...defaultProps} {...props} />);
};
describe('Pagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render pagination with correct currentPage, totalPages, prev & next buttons if provided', () => {
      renderComponent();

      expect(screen.getByTestId('mock-pagination')).toBeInTheDocument();

      expect(screen.getByTestId('interactive-prev-page-btn')).toBeInTheDocument();
      expect(screen.getByTestId('interactive-next-page-btn')).toBeInTheDocument();

      expect(screen.getByTestId('item-slot-next')).toBeInTheDocument();
      expect(screen.getByTestId('item-slot-previous')).toBeInTheDocument();

      expect(screen.getByTestId('current-page')).toHaveTextContent(String(defaultProps.currentPage));
      expect(screen.getByTestId('total-pages')).toHaveTextContent(String(defaultProps.totalPages));
    });

    it('should correctly handle custom props', () => {
      const overrideProps = { currentPage: 2, totalPages: 2 };
      renderComponent(overrideProps);

      expect(screen.getByTestId('current-page')).toHaveTextContent(String(overrideProps.currentPage));
      expect(screen.getByTestId('total-pages')).toHaveTextContent(String(overrideProps.totalPages));
    });
    it('should render custom icons via renderItem', () => {
      renderComponent();

      expect(within(screen.getByTestId('item-slot-next')).getByTestId('custom-next-icon')).toBeInTheDocument();
      expect(within(screen.getByTestId('item-slot-previous')).getByTestId('custom-previous-icon')).toBeInTheDocument();
    });
    it('handles missing totalPages gracefully', () => {
      renderComponent({ totalPages: undefined });
      
      expect(screen.getByTestId('total-pages')).toHaveTextContent('');
    });
    it.each([
      { prop: 'hideNextButton', testId: 'next-page-btn', shouldHide: true },
      { prop: 'hidePrevButton', testId: 'prev-page-btn', shouldHide: true },
    ])('should hide the $testId button if $prop is $shouldHide', 
      ({ prop, testId, shouldHide }) => {
        renderComponent({ [prop]: shouldHide });
    
        expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
      });
  });
  describe('Interactions', () => {
    it('should call onPageChange if user clicks on the next button', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId('next-page-btn'));
      expect(mockOnPageChange).toHaveBeenCalledWith(expect.any(Object), defaultProps.currentPage as number + 1);
    });
  });
});
