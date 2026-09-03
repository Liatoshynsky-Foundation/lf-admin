import { render } from '@testing-library/react';

import { EditBlockSkeleton } from './EditBlockSkeleton';

describe('EditBlockSkeleton', () => {
  it('should render successfully', () => {
    const { container } = render(<EditBlockSkeleton />);

    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('MuiSkeleton-root');
  });
});
