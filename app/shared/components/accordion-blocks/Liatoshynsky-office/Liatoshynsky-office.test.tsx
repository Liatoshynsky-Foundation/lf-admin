import { render, screen } from '@testing-library/react';

import { LiatoshynskyOffice } from './Liatoshynsky-office';
import { hardcodedData } from './Liatoshynsky-office.const';

jest.mock('../../design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="collapsible-block">
      <div>{title}</div>
      {children}
    </div>
  )
}));

describe('Liatoshynsky-office', () => {
  it('should render Liatoshynsky-office block with title and quote data', () => {
    render(<LiatoshynskyOffice />);
    expect(screen.getByText('Кабінет Лятошинського')).toBeInTheDocument();
    expect(screen.getByDisplayValue(hardcodedData.mainQuote)).toBeInTheDocument();
    expect(screen.getByDisplayValue(hardcodedData.caption)).toBeInTheDocument();
  });
});
