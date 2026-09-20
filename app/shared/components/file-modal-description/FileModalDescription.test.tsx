import { render, screen } from '@testing-library/react';

import { FileModalDescription, SpanText } from './FileModalDescription';

describe('FileModalDescription', () => {
  it.each([
    ['delete', 'видалити', 'видалення'],
    ['rename', 'перейменувати', 'перейменування']
  ] as const)('renders the %s warning copy and filename', (mode, action, warning) => {
    render(<FileModalDescription mode={mode} filename="document.pdf" />);

    expect(screen.getByText(new RegExp(action))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(warning))).toBeInTheDocument();
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('Ви впевнені, що хочете продовжити?')).toBeInTheDocument();
  });

  it('renders SpanText as an inline span', () => {
    render(<SpanText>filename.jpg</SpanText>);

    expect(screen.getByText('filename.jpg').tagName).toBe('SPAN');
  });
});
