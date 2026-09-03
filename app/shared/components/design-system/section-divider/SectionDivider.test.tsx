import { fireEvent, render, screen } from '@testing-library/react';

import SectionDivider from './SectionDivider';

describe('SectionDivider', () => {
  it('should render children correctly', () => {
    render(<SectionDivider>Section Name</SectionDivider>);
    expect(screen.getByText('Section Name')).toBeInTheDocument();
  });

  it('should not render delete button if onDelete is not provided', () => {
    const { container } = render(<SectionDivider>Section Name</SectionDivider>);
    const deleteButton = container.querySelector('svg');
    expect(deleteButton).not.toBeInTheDocument();
  });

  it('should render delete button if onDelete is provided', () => {
    const { container } = render(<SectionDivider onDelete={jest.fn()}>Section Name</SectionDivider>);
    const deleteButton = container.querySelector('svg');
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', () => {
    const onDeleteMock = jest.fn();
    const { container } = render(<SectionDivider onDelete={onDeleteMock}>Section Name</SectionDivider>);
    const deleteButton = container.querySelector('svg')?.parentElement;
    
    expect(deleteButton).toBeInTheDocument();
    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(onDeleteMock).toHaveBeenCalledTimes(1);
    }
  });

  it('should attach the custom testId to the delete button to allow querying in parent component tests', () => {
    render(
      <SectionDivider onDelete={jest.fn()} testId="custom-delete-btn">
        Section Name
      </SectionDivider>
    );
    expect(screen.getByTestId('custom-delete-btn')).toBeInTheDocument();
  });
});
