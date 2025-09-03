import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import Team from './Team';

jest.mock('~/components/contributor-card/ContributorCard', () => ({
  ContributorCard: ({ contributorNameValue, contributorDescriptionValue }: any) => (
    <div data-testid="contributor-card">
      <span>{contributorNameValue}</span>
      <span>{contributorDescriptionValue}</span>
    </div>
  )
}));

jest.mock('~/ds-components/button/Button');

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="collapsible-block">{props.children}</div>
}));

jest.mock('~/ds-components/colored-svg/ColoredSvg', () => ({
  Svg: (props: any) => <svg data-testid="svg" {...props} />
}));

jest.mock('~/ds-components/text-field/TextField', () => ({
  CustomTextField: (props: any) => (
    <input data-testid={props.title} defaultValue={props.defaultValue} onChange={props.onChange} />
  )
}));

jest.mock('~/public/icons/plus.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="plus-icon" />
}));

jest.mock('~/public/icons/trash.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="trash-icon" />
}));

const contributors = [
  { name: 'John Doe', description: 'smth' },
  { name: 'Jane Doe', description: 'smth' }
];

describe('Team block', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    render(<Team introText="Intro" sectionTitle="Section" contributors={contributors} />);
  });

  it('renders intro text, section title, and contributors', () => {
    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId('Вступний текст секції')).toHaveValue('Intro');
    expect(screen.getByTestId('Заголовок секції')).toHaveValue('Section');
    expect(screen.getAllByTestId('contributor-card')).toHaveLength(2);
    expect(screen.queryByText(contributors[0].name)).toBeInTheDocument();
    expect(screen.getByText(contributors[1].name)).toBeInTheDocument();
  });

  it('calls addContributor when add button is clicked', () => {
    fireEvent.click(screen.getByText(/Додати учасника/i));

    expect(screen.getAllByTestId('contributor-card')).toHaveLength(3);
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('desc')).toBeInTheDocument();
  });

  it('removes a contributor when trash icon is clicked', () => {
    const trashButtons = screen.getAllByRole('button');

    fireEvent.click(trashButtons[0]);

    expect(screen.getAllByTestId('contributor-card')).toHaveLength(1);
    expect(screen.queryByText(contributors[0].name)).not.toBeInTheDocument();
    expect(screen.getByText(contributors[1].name)).toBeInTheDocument();
  });

  it('updates intro and section text fields with debounce', async () => {
    jest.useFakeTimers();

    const introInput = screen.getByTestId('Вступний текст секції');
    const sectionInput = screen.getByTestId('Заголовок секції');
    fireEvent.change(introInput, { target: { value: 'New Intro' } });
    fireEvent.change(sectionInput, { target: { value: 'New Section' } });

    jest.runAllTimers();
    await waitFor(() => {
      expect(introInput).toHaveValue('New Intro');
      expect(sectionInput).toHaveValue('New Section');
    });
    jest.useRealTimers();
  });
});
