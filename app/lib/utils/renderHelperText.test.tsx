import { render, screen } from '@testing-library/react';

import { renderHelperText } from './renderHelperText';

describe('renderHelperText', () => {
  it('returns null if text is null', () => {
    const { container } = render(<>{renderHelperText(null)}</>);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders error text', () => {
    render(<>{renderHelperText('Введіть пароль')}</>);
    expect(screen.getByText('Введіть пароль')).toBeInTheDocument();
  });

  it('renders AlertCircle icon', () => {
    const { container } = render(<>{renderHelperText('Помилка')}</>);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
